import React from "react";
import { useState, useEffect } from "react";
<<<<<<< HEAD
const API_URL = import.meta.env.VITE_API_URL;

function ChatgptApi({ weatherData, userData }) {
    const [gptData, setGptData] = useState("");


    //gpt 출력 로직
    const call_get = async () => {
=======
import OpenAI from "openai";
import Loading from '../header_footer/loding'

import WeatherChart from "../page_component/weatherChart";

function chatgptApi({weatherData, userData}) {
    const [gptData, setGptData] = useState("")
    
    const [loading, setLoading] = useState(false);
    const [currentWeather, setCurrentWeather] = useState([]);

    useEffect(() => {
        const savedWeather = localStorage.getItem("currentWeather");
        if (savedWeather) {
            setCurrentWeather(JSON.parse(savedWeather));
            console.log("sccuess weather", savedWeather);
        }
    }, []);


    //회원 정보를 가져오기 
    // useEffect(() => {
    //     async function fetchUserData() {
    //         const userId = localStorage.getItem('userId');

    //         try {
    //             const response = await fetch(`http://localhost:8080/api/users/show/${userId}`, {
    //                 method: "GET",
    //                 headers: {
    //                     'Authorization': `Bearer ${localStorage.getItem('token')}`,
    //                     'Content-Type': 'application/json'
    //                 }
    //             });
    //             const data = await response.json();
    //             setUserData(data);
    //         } catch (error) {
    //             console.error("사용자 정보 가져오기 실패:", error);
    //             console.log("Fetched token:", localStorage.getItem('token'));
    //             console.log("Fetched username:", localStorage.getItem('userId'));
    //         }
    //     }

    //     fetchUserData();
    // }, []);


    //gpt 출력 로직(옷차림)
    const call_get_style = async (savedWeather) => {
        setLoading(true);
>>>>>>> 9207541e5f044c8bbc0c9160ef8f8c4d9a2f76cd
        if (!weatherData || !weatherData.temp) { // temp 속성 체크
            console.error("Weather data is missing or incomplete:", weatherData);
            return; // weatherData가 유효하지 않을 경우 함수 종료
        }
<<<<<<< HEAD
=======

        console.log('weather: ', savedWeather.temp);
>>>>>>> 9207541e5f044c8bbc0c9160ef8f8c4d9a2f76cd
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
<<<<<<< HEAD
                        { role: "user", content: `오늘 날씨는 ${weatherData.temp}°C, ${weatherData.weather}, 옷 취향은 캐주얼이고 실내 활동을 좋아하는 ${userData.age}세 여자의 옷 차림을 추천해줘, 간략하게` },
=======
                        { role: "user", content: `오늘 날씨는 ${savedWeather.temp}, ${savedWeather.description}, 옷 취향은 레이어드고 실외 활동을 좋아하는 ${userData.age}세 남자의 옷 차림을 추천해줘, 간략하게` },
>>>>>>> 9207541e5f044c8bbc0c9160ef8f8c4d9a2f76cd
                    ],
                    temperature: 0.5,
                    max_tokens: 50,
                })
            });
            const data = await response.json();
<<<<<<< HEAD
            setGptData(data.choices[0].message.content);
            console.log("Response: ", data);
            sendGptResult(data.choices[0].message.content); // 문자열만 전달
=======
            const recStyle = data.choices[0].message.content;
            setGptData(recStyle);
            setLoading(false);
            sendGptResult(recStyle, 'style');
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
                    max_tokens: 50,
                })
            });

            const data = await response.json();
            const recActivity = data.choices[0].message.content;
            setGptData(recActivity);
            console.log("Response: ", recActivity);
            setLoading(false);
            sendGptResult(recActivity, 'activity');
>>>>>>> 9207541e5f044c8bbc0c9160ef8f8c4d9a2f76cd
        } catch (error) {
            console.error("API 호출 실패:", error);
        }
    };

<<<<<<< HEAD
    //결과값을 서버로 전송
    const sendGptResult = async (recommendation) => {
        const userId = localStorage.getItem('userId');
        const username = localStorage.getItem('social_username'); // Fetching username for social login
        console.log(userId || username); // Log either userId or username
        console.log(recommendation);
    
        if (!recommendation) {
            console.error("내용이 존재하지 않습니다.");
            return;
        }
    
        try {
            let response;
    
            // Check if the user is logged in with a userId or username
            if (userId) {
                response = await fetch(`${API_URL}/api/chat/save`, {
                    method: "POST",
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        userId: userId,
                        recommendation: recommendation,
                    }),
                });
            } else if (username) {
                response = await fetch(`${API_URL}/api/chat/social_save`, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include', // 쿠키를 포함하여 전송
                    body: JSON.stringify({
                        username: username,
                        recommendation: recommendation,
                    }),
                });
            } else {
                console.error("사용자 정보가 없습니다."); // No user information available
                return;
            }
    
=======

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
        // const bodyData = {
        //     temp_high: currentWeather.high,
        //     temp_low: currentWeather.low
        // };
        
        //type에 따라 다른 데이터 컬럼에 저장
        const bodyData={};
        if (type === 'style') {
            bodyData.recStyle = recData; // recStyle 컬럼에 저장
        } else if (type === 'activity') {
            bodyData.recActivity = recData; // recActivity 컬럼에 저장
        }


        if(userId)
        {try {
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

>>>>>>> 9207541e5f044c8bbc0c9160ef8f8c4d9a2f76cd
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
                    bodyData
                }),
            });

        }
    };
    
    return (
<<<<<<< HEAD
        <div>
            <button onClick={call_get}> 옷차림 추천 받기 </button>
            <br />
            {gptData && <div>{gptData}</div>}
        </div>
    );
=======
        <>
            <div>
                <button onClick={call_get_style}> 옷차림 추천 </button>
                <button onClick={call_get_activity}>활동 추천</button>
                <br />
                {loading ? <Loading/> : null}
                {gptData && <div>{gptData}</div>}
            </div>
        </>
    )
>>>>>>> 9207541e5f044c8bbc0c9160ef8f8c4d9a2f76cd
}

export default ChatgptApi;
