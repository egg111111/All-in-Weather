import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './dashboard.css';
import axios from 'axios';
import WeatherChart from "./weatherChart"; 

function Dashboard() {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState(null);
    const [error, setError] = useState(null);
    const [nickname, setNickname] = useState('');

    // 사용자 정보 가져오기
    useEffect(() => {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');

        // 일반 로그인 확인
        if (userId && token) {
            fetch(`http://localhost:8080/api/users/show/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    }
                    throw new Error("Failed to fetch user data");
                })
                .then(data => {
                    setUserInfo(data);
                })
                .catch(error => {
                    console.error("Error fetching user data:", error);
                    setError("Failed to fetch user information");
                });
        } else {
            // 소셜 로그인일 경우 쿠키 기반으로 사용자 정보 요청
            axios.get('http://localhost:8080/api/users/social_user', { withCredentials: true })
                .then(response => {
                    setUserInfo(response.data);
                    const social_username = response.data.social_username;
                    const nickname = response.data.nickname;
                    localStorage.setItem('social_username', social_username);
                    localStorage.setItem('nickname', nickname);
                })
                .catch(error => {
                    console.error("Error fetching user info:", error);
                    setError("Failed to fetch user information");
                });
            localStorage.removeItem('userId'); 
        }

    }, [nickname]);

    return (
        <>
            {/* WeatherChart 컴포넌트를 이용해 날씨 정보 및 차트 표시 */}
            <WeatherChart userData={userInfo} />

            <div> 
                {error ? ( 
                    <div>{error}</div> 
                ) : userInfo ? ( 
                    <div> 
                        <strong>안녕하세요</strong> {userInfo.nickname ? userInfo.nickname : userInfo.username}님
                    </div>
                ) : ( 
                    <div>Loading user information...</div>
                )} 
            </div>

            <button> 활동 추천 </button>
            {/* <ChatgptApi  /> */}
        </>
    );
}

export default Dashboard;
