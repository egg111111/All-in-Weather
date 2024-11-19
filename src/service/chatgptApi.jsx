import React from "react";
import { useState, useEffect } from "react";
const API_URL = import.meta.env.VITE_API_URL;

import OpenAI from "openai";
import Loading from '../header_footer/loading'
import { useNavigate } from "react-router-dom";
import Result from "../page_component/result";

function chatgptApi({weatherData, userData}) {
    const [gptData, setGptData] = useState("")
    
    const [loading, setLoading] = useState(false);
    const [currentWeather, setCurrentWeather] = useState([]);
    const [userStyle, setUserStyle] = useState(""); // 사용자 스타일 상태 추가
    const [gptImage, setGptImage] = useState("");




    const navigate = useNavigate();

    useEffect(() => {
        const savedWeather = localStorage.getItem("currentWeather");
        if (savedWeather) {
            setCurrentWeather(JSON.parse(savedWeather));
            console.log("sccuess weather", savedWeather);
        }
    }, []);


    //gpt 출력 로직(옷차림)
    const call_get_style = async (savedWeather) => {
        setLoading(true);
        if (!weatherData || !weatherData.temp) { // temp 속성 체크
            console.error("Weather data is missing or incomplete:", weatherData);
            return; // weatherData가 유효하지 않을 경우 함수 종료
        }try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${import.meta.env.VITE_GPT_KEY}`,
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        { role: "user", content: `오늘 날씨는 ${savedWeather.temp}, ${savedWeather.description}, 옷 취향은 ${userStyle}이고 실외 활동을 좋아하는 ${userData.age}세 남자의 옷 차림을 추천해줘, 간략하게` },
                    ],

                    temperature: 0.5,
                    max_tokens: 500,
                })
            });
            const data = await response.json();
            const recStyle = data.choices[0].message.content;
            setGptData(recStyle);
            setLoading(false);
            sendGptResult(recStyle, 'style');

            call_generate_clothing_image(recStyle); // 텍스트를 바탕으로 이미지 생성

            navigate("/result", { state: { result: recStyle, type: "옷차림 추천" , gptImage} });
        } catch (error) {
            console.error("API 호출 실패:", error);
        }
    }

    //gpt 출력 로직(활동)
    const call_get_activity = async (savedWeather) => {
        setLoading(true);
        if (!weatherData || !weatherData.temp) { // temp 속성 체크
            console.error("Weather data is missing or incomplete:", weatherData);
            return; // weatherData가 유효하지 않을 경우 함수 종료
        }

        try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${import.meta.env.VITE_GPT_KEY}`,
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        { role: "user", content: `오늘 날씨는 ${savedWeather.temp}, ${savedWeather.weather}, 실외 활동을 좋아하는 ${userData.age}세 여자의 오늘 활동을 추천해줘, 간략하게` },
                    ],
                    temperature: 0.5,
                    max_tokens: 500,
                })
            });

            const data = await response.json();
            const recActivity = data.choices[0].message.content;
            setGptData(recActivity);
            console.log("Response: ", recActivity);
            setLoading(false);
            sendGptResult(recActivity, 'activity');
            navigate("/result", { state: { result: recActivity, type: "활동 추천" } });
        } catch (error) {
            console.error("API 호출 실패:", error);
        }
    };
  //결과값을 서버로 전송 
    const sendGptResult = async (recData, type) => {
        const userId = localStorage.getItem('userId');
        console.log(recData);
        if (!weatherData || !weatherData.temp) { // temp 속성 체크
            console.error("Weather data is missing or incomplete:", weatherData);
            return; // weatherData가 유효하지 않을 경우 함수 종료
        }

        if(!recData){
            console.error("내용이 존재하지 않습니다.")
            return;
        }
        const bodyData={};
        if (type === 'style') {
            bodyData.recStyle = recData; // recStyle 컬럼에 저장
        } else if (type === 'activity') {
            bodyData.recActivity = recData; // recActivity 컬럼에 저장
        }

        if(userId){
        try {
            const response = await fetch(`http://localhost:8080/api/chat/save`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: userId,
                    temp_high: currentWeather.high,
                    temp_low: currentWeather.low,
                    recStyle : bodyData.recStyle,
                    recActivity : bodyData.recActivity })
            });

            if (response.ok) {
                console.log("GPT 결과값 서버 전송 성공");
            } else {
                console.error("서버로 GPT 결과값 전송 실패:", response.statusText);
            }
        } catch (error) {
            console.error("서버 전송 중 오류 발생:", error);
        }} else if(username) {
            response = await fetch(`http://localhost:8080/api/chat/social_save`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // 쿠키를 포함하여 전송
                body: JSON.stringify({
                    username: username,
                    temp_high: currentWeather.high,
                    temp_low: currentWeather.low,
                    recStyle : bodyData.recStyle,
                    recActivity : bodyData.recActivity
                }),
            });

        }}

    if(loading){
        return <Loading />;
    }

    const call_generate_clothing_image = async (recStyle) => {
        try {
            const prompt = `A stylish outfit based on the following description: ${recStyle}, without showing the face, only the body and clothing from head to toe.`;
           
            const response = await fetch("https://api.openai.com/v1/images/generations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${import.meta.env.VITE_GPT_KEY}`,
                },
                body: JSON.stringify({
                    prompt: prompt,
                    n: 1,
                    size: "1024x1024", // 이미지 크기 설정
                }),
            });
    
    
            const data = await response.json();
            console.log("DALL·E Response: ", data); // 응답 데이터 콘솔 출력
            if (data.data && data.data[0].url) {
                setGptImage(data.data[0].url); // 이미지 URL 저장
            } else {
                console.error("DALL·E 이미지 생성 실패.");
            }
        } catch (error) {
            console.error("DALL·E API 호출 실패:", error);
        }
    };
    


    return ( 
    <>
            <div>
                <button onClick={call_get_style}> 옷차림 추천 </button>
                <br/>
                <br/>
                <button onClick={call_get_activity}>활동 추천</button>
                {/* {gptData && <div>{gptData}</div>} */}
            </div>

            
        </>
    )
}
export default chatgptApi;
