import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './dashboard.css';
import axios from 'axios';
import WeatherChart from "./weatherChart"; 
const API_URL = import.meta.env.VITE_API_URL;

function Dashboard() {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState(null);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        const social_userId = localStorage.getItem('social_userId');

        // 소셜 로그인인 경우 userId를 localStorage에 저장
        if (!userId && !social_userId) {
            // 소셜 로그인 사용자의 userId를 가져와서 localStorage에 저장
            axios.get(`${API_URL}/api/users/social_user`, { withCredentials: true })
                .then(response => {
                    const userData = response.data;
                    const social_userId = userData.social_userId;
                    localStorage.setItem('social_userId', social_userId);
                    fetchUserInfo(social_userId);  // 소셜 로그인 후 사용자 정보 요청
                })
                .catch(error => {
                    console.error("Error fetching social user info:", error);
                    setError("Failed to fetch user information");
                });
        } else {
            // 일반 로그인인 경우
            fetchUserInfo(userId || social_userId, token);
        }
    }, []);

    const fetchUserInfo = (userId, token = null) => {
        const fetchOptions = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            ...(userId && { credentials: 'include' }),  // 소셜 로그인인 경우 쿠키 포함
        };

        fetch(`${API_URL}/api/users/show/${userId}`, fetchOptions)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to fetch user data");
                }
                return response.json();
            })
            .then(data => {
                setUserInfo(data);
                console.log("User Info:", data);  // 콘솔에 출력
            })
            .catch(error => {
                console.error("Error fetching user data:", error);
                setError("Failed to fetch user information");
            });
    };

    return (
        <>
            <WeatherChart userData={userInfo} />
            <div>
                {error ? (
                    <div>{error}</div>
                ) : userInfo ? (
                    <div>
                        <strong>안녕하세요</strong> {userInfo.nickname}님
                        <br />
                        <strong>사용자 ID: </strong>{userInfo.userId}
                    </div>
                ) : (
                    <div>Loading user information...</div>
                )}
            </div>
        </>
    );
}

export default Dashboard;
