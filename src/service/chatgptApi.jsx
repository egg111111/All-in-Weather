import React from "react";
import { useState, useEffect } from "react";
const API_URL = import.meta.env.VITE_API_URL;

function ChatgptApi({ weatherData, userData }) {
    const [gptData, setGptData] = useState("");


    //gpt 출력 로직
    const call_get = async () => {
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
                        { role: "user", content: `오늘 날씨는 ${weatherData.temp}°C, ${weatherData.weather}, 옷 취향은 캐주얼이고 실내 활동을 좋아하는 ${userData.age}세 여자의 옷 차림을 추천해줘, 간략하게` },
                    ],
                    temperature: 0.5,
                    max_tokens: 50,
                })
            });
            const data = await response.json();
            setGptData(data.choices[0].message.content);
            console.log("Response: ", data);
            sendGptResult(data.choices[0].message.content); // 문자열만 전달
        } catch (error) {
            console.error("API 호출 실패:", error);
        }
    };

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
    
            if (response.ok) {
                console.log("GPT 결과값 서버 전송 성공");
            } else {
                console.error("서버로 GPT 결과값 전송 실패:", response.statusText);
            }
        } catch (error) {
            console.error("서버 전송 중 오류 발생:", error);
        }
    };
    
    return (
        <div>
            <button onClick={call_get}> 옷차림 추천 받기 </button>
            <br />
            {gptData && <div>{gptData}</div>}
        </div>
    );
}

export default ChatgptApi;
