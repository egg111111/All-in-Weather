import React from "react";
import { useState, useEffect } from "react";

import OpenAI from "openai";
import Loading from "../header_footer/loading";
import { useNavigate } from "react-router-dom";
import WeatherChart from "../page_component/weatherChart";

function chatgptApi({weatherData, userData}) {
    const [gptData, setGptData] = useState("")
    const [gptImage, setGptImage] = useState(""); 

    const [loading, setLoading] = useState(false);
    const [currentWeather, setCurrentWeather] = useState([]);
    const [userStyle, setUserStyle] = useState(""); // 사용자 스타일 상태 추가

    const navigate = useNavigate();

    useEffect(() => {
        const savedWeather = localStorage.getItem("currentWeather");
        if (savedWeather) {
            setCurrentWeather(JSON.parse(savedWeather));
            console.log("useEffect weather", savedWeather);
        }
    }, []);

    const getUserStyle = async (userId, social_userId) => {
        try {
            const UserId = userId || social_userId;
            if (!UserId) {
                console.error("No userId or social_userId provided.");
                return;
            }
    
            // 토큰 가져오기 (일반 로그인용)
            const token = localStorage.getItem('token');
    
            // fetch 옵션 설정
            const fetchOptions = {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && userId ? { Authorization: `Bearer ${token}` } : {}), // 일반 로그인: 토큰 헤더 추가
                },
                ...(social_userId && { credentials: 'include' }), // 소셜 로그인: 쿠키 포함
            };
    
            // fetch 요청
            const response = await fetch(`http://localhost:8080/api/users/style/${UserId}`, fetchOptions);
    
            // 응답 처리
            if (response.ok) {
                const userStyles = await response.json(); // 여러 스타일을 받을 수 있음
                if (userStyles && userStyles.length > 0) {
                    console.log("User Styles: ", userStyles); // 콘솔에 스타일 리스트 출력
                    return userStyles[2].style; // 반환 // 예시로 첫 번째 스타일 사용
                } else {
                    console.log("No styles found for user.");
                }
            } else {
                console.error(`Failed to fetch user styles: ${response.statusText}`);
            }
        } catch (error) {
            console.error("사용자 스타일 가져오기 실패:", error);
        }
    };
    

    //gpt 출력 로직(옷차림)
    const call_get_style = async () => {
        setLoading(true);
         // 사용자 스타일 가져오기
         const userId = localStorage.getItem("userId");
         const social_userId = localStorage.getItem("social_userId");
         navigate("/result", { state: { result: null, imageUrl: null, type: "옷차림 추천", loading: true ,imageLoading: true } });
        
         try {
            if (!currentWeather || !currentWeather.temp) {
                console.error("Weather data is missing or incomplete:", currentWeather);
                return;
            }
    
            const style = await getUserStyle(userId, social_userId);
            const gender = userData.gender === 'male' ? '남자' : '여자';
    
            const messages = [
                {
                    role: "user",
                    content: `오늘 날씨는 ${currentWeather.temp}°C 이고, ${currentWeather.weather}, 옷 취향은 ${style}이고 실외 활동을 좋아하는 ${userData.age}세 ${gender}의 옷 차림을 추천해줘, 간략하게`
                }
            ];
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${import.meta.env.VITE_GPT_KEY}`,
                },
                body: JSON.stringify({
                    model: "gpt-4",
                    messages: messages,
                    temperature: 0.5,
                    max_tokens: 500,
                }),
            });
    
            const data = await response.json();
            const recStyle = data.choices[0].message.content;
    
            navigate("/result", { state: { result: recStyle, imageUrl: null, type: "옷차림 추천", loading: false, imageLoading: true } });
            const TranslatedRecStyle = await translateToEnglish(recStyle);
    
            // 이미지 생성
            const gptImageUrl = await call_generate_clothing_image(TranslatedRecStyle, gender, style);
    
            // `/result` 페이지에 업데이트할 데이터 전송
            navigate("/result", { state: { result: recStyle, imageUrl: gptImageUrl, type: "옷차림 추천", loading: false, imageLoading: false } });
             
            // 결과값 전송
            sendGptResult(recStyle, "style");
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

    const call_generate_clothing_image = async (recStyle, gender, userStyle) => {
    try {
        const engGender = await translateToEnglish(gender); // '남자' -> 'male', '여자' -> 'female'
        const engWeather = await translateToEnglish(currentWeather.weather); // '맑음' -> 'clear', '흐림' -> 'cloudy', 등
        const engUserStyle = await translateToEnglish(userStyle);
        //const engUserStyle = await translateToEnglish(style);
        const prompt = `
            A ${engUserStyle} style outfit for a ${engGender}, suitable for ${currentWeather.temp}°C (${engWeather} weather).
            The outfit includes: ${recStyle}.
            The image should showcase the entire body outfit without showing the face. Focus on the clothing and body details, ensuring the face is cropped or excluded from the image.
        `.trim(); 
        console.log("Generated Prompt for DALL·E:", prompt);
        console.log("dall e print userStyle : ", engUserStyle );
        console.log("dall e print gender : ", engGender );
        console.log("dall e print temp : ", currentWeather.temp );
        console.log("dall e print weather : ", engWeather );

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
            return data.data[0].url; // URL 반환
        } else {
            console.error("DALL·E 이미지 생성 실패.");
        }
    } catch (error) {
        console.error("DALL·E API 호출 실패:", error);
    }
};


    //결과값을 서버로 전송 
    const sendGptResult = async (recData, type) => {
        const userId = localStorage.getItem('userId');
        const social_userId = localStorage.getItem("social_userId");
        const UserId = userId || social_userId; // userId 또는 social_userId 중 하나를 사용
    
        console.log(recData);
    
        // 데이터 유효성 체크
        if (!weatherData || !weatherData.temp) {
            console.error("Weather data is missing or incomplete:", weatherData);
            return;
        }
    
        if (!recData) {
            console.error("내용이 존재하지 않습니다.");
            return;
        }
    
        // 요청에 포함할 데이터 생성
        const bodyData = {
            userId: UserId, // 항상 userId로 전송
            temp_high: currentWeather.high,
            temp_low: currentWeather.low,
            recStyle: type === 'style' ? recData : null,
            recActivity: type === 'activity' ? recData : null,
        };
    
        // 요청 옵션 설정
        const fetchOptions = {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                ...(userId && { Authorization: `Bearer ${localStorage.getItem('token')}` }), // 일반 로그인일 경우 토큰 추가
            },
            ...(social_userId && { credentials: 'include' }), // 소셜 로그인일 경우 쿠키 포함
            body: JSON.stringify(bodyData),
        };
    
        // API 호출
        try {
            const response = await fetch(`http://localhost:8080/api/chat/save`, fetchOptions);
    
            if (response.ok) {
                console.log("GPT 결과값 서버 전송 성공");
            } else {
                console.error("서버로 GPT 결과값 전송 실패:", response.statusText);
            }
        } catch (error) {
            console.error("서버 전송 중 오류 발생:", error);
        }
    };
    
    const translateToEnglish = async (text) => {
        try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${import.meta.env.VITE_GPT_KEY}`,
                },
                body: JSON.stringify({
                    model: "gpt-4", // 또는 gpt-3.5-turbo
                    messages: [
                        { role: "user", content: `Translate the following text to English: ${text}` },
                    ],
                    temperature: 0.3,
                    max_tokens: 500,
                }),
            });
    
            const data = await response.json();
            return data.choices[0].message.content.trim();
        } catch (error) {
            console.error("Translation API 호출 실패:", error);
            return text; // 번역 실패 시 원본 텍스트 반환
        }
    };
    
    return (
        <>
            <div>
                <button onClick={call_get_style}> 옷차림 추천 </button>
                <br/>
                <br/>
                <button onClick={call_get_activity}>활동 추천</button>
                <br />
                {loading ? <Loading/> : null}
                {gptData && <div>{gptData}</div>}
                {gptImage ? (
                    <div>
                        <h3>추천된 옷차림</h3>
                        <img src={gptImage} alt="Generated Outfit" style={{ maxWidth: "100%" }} /> {/* DALL·E 이미지 출력 */}
                    </div>
                ) : (
                    !loading && <div></div>  // 이미지가 없을 때 로딩 상태 표시
                )}
            </div>
        </>
    )
}

export default chatgptApi;
