import React from "react";
import { useState, useEffect } from "react";
import OpenAI from "openai";

function chatgptApi(weatherData) {
    console.log(weatherData);
    const [gptData, setGptData] = useState("")
    const [userData, setUserData] = useState({
        userId: "",
        username: "",
        email: "",
        age: "",
        // gender: ""
    });

    //회원 정보를 가져오기 
    useEffect(() => {
        async function fetchUserData() {
            const userId = localStorage.getItem('userId');

            try {
                const response = await fetch(`http://localhost:8080/api/users/show/${userId}`, {
                    method: "GET",
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                setUserData(data);
            } catch (error) {
                console.error("사용자 정보 가져오기 실패:", error);
                console.log("Fetched token:", localStorage.getItem('token'));
                console.log("Fetched username:", localStorage.getItem('userId'));
            }
        }

        fetchUserData();
    }, []);


    //gpt 출력 로직 
    const call_get = async () => {
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
                        { role: "user", content: `오늘 날씨는 ${weatherData.temp}, ${weatherData.description}, 옷 취향은 캐주얼이고 실내 활동을 좋아하는 ${userData.age}세 여자의 옷 차림을 추천해줘, 간략하게` },
                    ],
                    temperature: 0.5,
                    max_tokens: 50,
                })
            });

            const data = await response.json();
            setGptData(data.choices[0].message.content);
            console.log("Response: ", data);
            sendGptResult(data);
        } catch (error) {
            console.error("API 호출 실패:", error);
        }
    }


    //결과값을 서버로 전송 
    const sendGptResult = async (recommendation) => {
        const userId = localStorage.getItem('userId');
        console.log(recommendation);
        if(!recommendation){
            console.error("내용이 존재하지 않습니다.")
            return;
        }
        try {
            const response = await fetch(`http://localhost:8080/api/chat/save`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: userId,
                    recommendation: recommendation
                })
            });

            if (response.ok) {
                console.log("GPT 결과값 서버 전송 성공");
            } else {
                console.error("서버로 GPT 결과값 전송 실패:", response.statusText);
            }
        } catch (error) {
            console.error("서버 전송 중 오류 발생:", error);
        }
    }


    return (
        <>
            <div>
                <button onClick={call_get}> 옷차림 추천 </button>
                <br />
                {gptData && <div>{gptData}</div>}
            </div>
        </>
    )
}

export default chatgptApi;