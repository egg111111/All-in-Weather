import React from "react";
import { useState, useEffect } from "react";

import OpenAI from "openai";
import Loading from "../header_footer/loading";
import { useNavigate } from "react-router-dom";
import Result from "../page_component/result";
import WeatherChart from "../page_component/weatherChart";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShirt } from "@fortawesome/free-solid-svg-icons";

import './chatgptApi.css'

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
            console.log("props weather", weatherData);
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
    
    const extractItems = (response) => {
        console.log("추출 텍스트 값 : ", response);
        const items = {
            outerwear: [],
            top: [],
            bottom: [],
            shoes: []
        };
    
        // 정규식 수정: `1. **아우터**:` 형식을 포함한 각 항목을 추출
        const outerwearPattern = /1\.\s?\*\*아우터\*\*:\s*(.+?)(?=\s*2\.)/gs;
        const topPattern = /2\.\s?\*\*상의\*\*:\s*(.+?)(?=\s*3\.)/gs;
        const bottomPattern = /3\.\s?\*\*하의\*\*:\s*(.+?)(?=\s*4\.)/gs;
        const shoesPattern = /4\.\s?\*\*신발\*\*:\s*(.+?)(?=\s*$)/gs;
    
        // 정규식으로 항목을 추출하고 배열로 저장
        const outerwearMatches = [...response.matchAll(outerwearPattern)];
        const topMatches = [...response.matchAll(topPattern)];
        const bottomMatches = [...response.matchAll(bottomPattern)];
        const shoesMatches = [...response.matchAll(shoesPattern)];
    
        // 디버깅: 추출된 항목 확인
        console.log("Outerwear Matches:", outerwearMatches);
        console.log("Top Matches:", topMatches);
        console.log("Bottom Matches:", bottomMatches);
        console.log("Shoes Matches:", shoesMatches);
    
        // 추출된 값을 각 항목에 넣기, 쉼표로 나누어 배열로 저장
        items.outerwear = outerwearMatches.length > 0 ? outerwearMatches[0][1].split(', ') : ["Default Outerwear"];  // 쉼표로 구분하여 배열에 저장
        items.top = topMatches.length > 0 ? topMatches[0][1].split(', ') : ["Default Top"];  // 쉼표로 구분하여 배열에 저장
        items.bottom = bottomMatches.length > 0 ? bottomMatches[0][1].split(', ') : ["Default Bottom"];  // 쉼표로 구분하여 배열에 저장
        items.shoes = shoesMatches.length > 0 ? shoesMatches[0][1].split(', ') : ["Default Shoes"];  // 쉼표로 구분하여 배열에 저장
    
        // 디버깅: 최종 추출된 항목
        console.log("Extracted Items:", items);
    
        return items;
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
                    content: `
                        오늘 날씨는 ${currentWeather.temp}°C이고, ${currentWeather.weather}입니다. 
                        옷 취향은 ${style}이며 실외 활동을 좋아하는 ${userData.age}세 ${gender}의 옷 차림을 추천해주세요.
        
                        다음 항목에 대한 옷을 추천해주세요. 각 항목에 대해 여러 가지 스타일을 고민하고, 추천 항목만 간단하게 나열해주세요:
                        1. **아우터**: 날씨에 맞는 외투나 자켓을 추천해주세요. (예: 코트, 자켓, 패딩, 트렌치코트 등 여러 가지 옵션을 고려해주세요)
                        2. **상의**: 상의는 어떤 스타일을 선호하시나요? (예: 터틀넥, 스웨터, 셔츠, 후드티 등 다양한 스타일을 추천해주세요)
                        3. **하의**: 하의는 어떤 스타일이 좋을까요? (예: 레깅스, 청바지, 슬랙스, 트라우저 등 여러 가지 옵션을 고려해주세요)
                        4. **신발**: 활동적인 날씨에 어울리는 편안한 신발을 추천해주세요. (예: 운동화, 부츠, 샌들 등 다양한 스타일을 추천해주세요)
                        
                        스타일을 선택할 때, 날씨와 실외 활동에 적합한 옷차림을 고려해주세요. 또한, 추천 항목은 간단하게 나열해주세요.
                    `
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
            const cleanedRecStyle = recStyle.replace(/\*\*/g, ""); // 모든 ** 제거
            const formattedRecStyle = cleanedRecStyle.replace(/(\d\.)/g, "$1\n"); // 숫자 뒤에 줄바꿈 추가

            const items = extractItems(recStyle);
            const translatedItems = {
                outerwear: await translateToEnglish(items.outerwear.join(", ")),
                top: await translateToEnglish(items.top.join(", ")),
                bottom: await translateToEnglish(items.bottom.join(", ")),
                shoes: await translateToEnglish(items.shoes.join(", "))
            };

            navigate("/result", { state: { result: formattedRecStyle, imageUrl: null, type: "옷차림 추천", loading: false, imageLoading: true } });
    
            // 이미지 생성
            const gptImageUrl = await call_generate_clothing_image(translatedItems, gender, style);
    
            // 결과값 전송
            sendGptResult(cleanedRecStyle, "style", gptImageUrl);

            // `/result` 페이지에 업데이트할 데이터 전송
            navigate("/result", { state: { result: formattedRecStyle, imageUrl: gptImageUrl, type: "옷차림 추천", loading: false, imageLoading: false } });
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

    const call_generate_clothing_image = async (translatedItems, gender, userStyle) => {
        try {
            const engGender = await translateToEnglish(gender); // '남자' -> 'male', '여자' -> 'female'
            const engWeather = await translateToEnglish(currentWeather.weather); // '맑음' -> 'clear', '흐림' -> 'cloudy', 등
            const engUserStyle = await translateToEnglish(userStyle);
    
            const prompt = `
                Create a ${engUserStyle} style outfit for a ${engGender}, suitable for ${currentWeather.temp}°C (${engWeather} weather).
                The image should only show the full body from the neck down, focusing on clothing details, with the figure facing forward. Ensure no head, face, or facial features are visible.
                The outfit includes:
                - Outerwear: ${translatedItems.outerwear}.
                - Top: ${translatedItems.top}.
                - Bottom: ${translatedItems.bottom}.
                - Shoes: ${translatedItems.shoes}.
                `.trim(); // 프롬프트는 1000자 이내로
    
            console.log("Generated Prompt for DALL·E:", prompt);
    
            // DALL·E API 호출
            const response = await fetch("https://api.openai.com/v1/images/generations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${import.meta.env.VITE_GPT_KEY}`,
                },
                body: JSON.stringify({
                    model: "dall-e-3",
                    prompt: prompt,
                    n: 1,
                    size: "1024x1792", // 이미지 크기 설정
                }),
            });
    
            const data = await response.json();
            console.log("DALL·E Response: ", data); // 응답 데이터 콘솔 출력
    
            if (data.data && data.data[0].url) {
                const gptImageUrl = data.data[0].url;
    
                // 백엔드를 통해 DALL·E 이미지를 S3로 업로드
                const s3ImageUrl = await uploadDalleImageToS3(gptImageUrl);
                if (s3ImageUrl) {
                    console.log("Image uploaded to S3:", s3ImageUrl);
                    setGptImage(s3ImageUrl); // 업로드된 이미지의 S3 URL 저장
                    return s3ImageUrl; // 업로드된 S3 URL 반환
                } else {
                    console.error("Failed to upload DALL·E image to S3");
                }
            } else {
                console.error("DALL·E 이미지 생성 실패.");
            }
        } catch (error) {
            console.error("DALL·E API 호출 실패:", error);
        }
    };

    //결과값을 서버로 전송 
    const sendGptResult = async (recData, type, gptImageUrl) => {
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
            imageUrl: gptImageUrl
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
    
    const uploadDalleImageToS3 = async (dalleImageUrl) => {
        try {
            const response = await fetch("http://localhost:8080/upload-dalle-image", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ url: dalleImageUrl }), // DALL·E URL 전달
            });
    
            if (response.ok) {
                const s3Url = await response.text(); // S3 URL 반환
                console.log("Image uploaded to S3:", s3Url);
                return s3Url;
            } else {
                console.error("Failed to upload DALL·E image to S3:", response.statusText);
            }
        } catch (error) {
            console.error("Error uploading DALL·E image to S3:", error);
        }
    };
    

    return (
        <>
            <div>
                {/* <div onClick={call_get_style}> 옷차림 추천 </div> */}
                <FontAwesomeIcon icon={faShirt} onClick={call_get_style}/> 
                {/* <button onClick={call_get_activity}>활동 추천</button>
                <br /> */}
                {/* {loading ? <Loading/> : null} */}
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
