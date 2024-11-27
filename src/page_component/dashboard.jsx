import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './dashboard.css';
import generalApiClient from '../service/generalApiClient'; // 일반 로그인용 API 클라이언트
import socialApiClient from '../service/socialApiClient';   // 소셜 로그인용 API 클라이언트
import WeatherChart from "./weatherChart";
import RecentCalendar from "../service/RecentCalendar"; 
import { notification } from 'antd'; // Ant Design의 Notification 컴포넌트

function Dashboard() {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState(null);
    const [error, setError] = useState(null);

    // Ant Design Notification 설정 함수
    const openNotification = (title, description) => {
        notification.open({
            message: title,
            description: description,
            placement: 'top', // 알림 위치
            duration: 0, // 알림이 자동으로 사라지지 않음, 사용자가 닫아야 함
        });
    };

    useEffect(() => {
        const userId = localStorage.getItem('userId');
        const socialUserId = localStorage.getItem('social_userId');

        if (!userId && !socialUserId) {
            // 소셜 로그인인 경우 userId를 localStorage에 저장
            socialApiClient.get('/api/users/social_user', { withCredentials: true })
                .then(response => {
                    const userData = response.data;
                    const social_userId = userData.social_userId;
                    localStorage.setItem('social_userId', social_userId);
                    fetchUserInfo(social_userId, true);  // 소셜 로그인 후 사용자 정보 요청
                })
                .catch(error => {
                    console.error("Error fetching social user info:", error);
                    setError("Failed to fetch user information");
                });
        } else {
            // 일반 로그인인 경우
            fetchUserInfo(userId || socialUserId, !!socialUserId);
        }
    }, []);

    const fetchUserInfo = (userId, isSocialLogin) => {
        // 로그인 타입에 따라 적절한 API 클라이언트 선택
        const apiClient = isSocialLogin ? socialApiClient : generalApiClient;

        apiClient.get(`/api/users/show/${userId}`)
            .then(response => {
                setUserInfo(response.data);
                console.log("User Info:", response.data);  // 콘솔에 출력
                // 사용자 정보 가져온 후 알림을 요청
                fetchNotifications(userId);
            })
            .catch(error => {
                console.error("Error fetching user data:", error);
                setError("Failed to fetch user information");
            });
    };

    const fetchNotifications = (userId) => {
        // 알림 정보를 서버에서 가져와 Notification 띄우기
        generalApiClient.get(`/api/notifications/upcoming?userId=${userId}`)
            .then(response => {
                const notifications = response.data;

                notifications.forEach(notification => {
                    openNotification(notification.title, notification.message);
                });
            })
            .catch(error => {
                console.error("Error fetching notifications:", error);
            });
    };

    return (
        <>
            {userInfo && <WeatherChart userData={userInfo} />}
            {userInfo && <RecentCalendar userData={userInfo} />} 
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
