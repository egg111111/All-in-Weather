import React from "react";
import { useState } from "react";
import OpenAI from "openai";

function chatgptApi() {
    const[gptData, setGptData] = useState("")
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
                        { role: "user", content: "옷 취향은 스트릿이고 야외 활동을 좋아하는 20대 여자의 옷 차림을 추천해줘" },
                    ],
                    temperature: 0.5,
                    max_tokens: 300,
                })
            });

            const data = await response.json();
            setGptData(data.choices[0].message.content);
            console.log("Response: ", data);
        } catch (error) {
            console.error("API 호출 실패:", error);
        }
    }

    return (
        <>
            <div>
                <button onClick={call_get}> 옷차림 추천 </button>
                <br/>
                {gptData && <div>{gptData}</div>} 
            </div>
        </>
    )
}

export default chatgptApi;