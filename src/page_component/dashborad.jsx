import React from "react";
import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";

import ChatgptApi from "../service/chatgptApi";
import './dashbaord.css';
import WeatherChart from "./weatherChart";
import Londing from "../header_footer/loding";

function dashboard() {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [username, setUsername] = useState("");
    //const username = localStorage.getItem('username');
    const [location, setLocation] = useState({ latitude: null, longitude: null });
    const [locationStatus, setLocationStatus] = useState("위치 정보 불러오는 중...");
    const [weatherData, setWeather] = useState("");

    const [userInfo, setUserInfo] = useState(null);
    const [error, setError] = useState(null);
    const [nickname, setNickname] = useState('');
    const userId = localStorage.getItem('userId');


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


     // 위치 정보 가져오기
     useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    // localStorage.setItem("latitude", latitude);
                    // localStorage.setItem("longitude", longitude);
                    setLocation({ latitude, longitude }); 
                    setLocationStatus("위치 정보 불러오기 성공");
                    console.log("현재 위치: 위도, 경도", latitude, longitude)
                    // getWeather(latitude, longitude);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setLocationStatus("위치 정보 불러오기 실패");
                }
            );
        } else {
            console.log("Geolocation is not supported by this browser.");
            setLocationStatus("위치 정보가 지원되지 않는 브라우저입니다.");
        }
    }, []);

    //사용자의 위치 정보가 로컬에 있으면 위험하니까 대시보드에서 전부 처리?
    //openWeatherMap API 로직 
    //날씨는 
    const getWeather = (latitude, longitude) => {
        const iconSection = document.querySelector('.icon');
        const Weather_Key = import.meta.env.VITE_WEATHER_KEY;
        fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${35.8714354}&lon=${128.601445}&appid=${Weather_Key}&units=metric&lang=kr`)
        .then((response) => {
            return response.json();
        })
        .then((json) => {
            const weatherData = {
                temp: json.current.temp,
                description: json.current.weather[0].description
            };
            const icon = json.current.weather[0].icon;
            const iconURL = `http://openweathermap.org/img/wn/${icon}@2x.png`;
            // iconSection.setAttribute('src', iconURL);
            setWeather(weatherData);
            console.log("weatherJSON",json);
            console.log(weatherData);
        })
        .catch((error)=>{
            console.error('Error: ', error);
        })
    }

        //username 가져오기 
        if(username){
            useEffect(() => {
                async function fetchUsername() {
                    const userId = localStorage.getItem('userId'); 
                    try {
                        const response = await fetch(`http://localhost:8080/api/users/show/${userId}`, {
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            }
                        });
                        if (response.ok) {
                            const data = await response.json();
                            setUsername(data.username); 
                        } else {
                            console.error("Failed to fetch username");
                        }
                    } catch (error) {
                        console.error("Error fetching username:", error);
                    }
                }
        
                fetchUsername();
            }, [username]);
        }


    //Gpt 호출 로직 
    const handleCall_GPT = async() => {
        ChatgptApi();
    }

    return (
        <>  
            <WeatherChart />

            

            {isMenuOpen && (
                <div className="menu">
                    <button onClick={handlePageClick}>마이 페이지</button>
                    <br/>
                    <button onClick={handleViewClick}>나의 추천 기록</button>
                    <br/>
                    <button onClick={handleLogout}>로그아웃</button>
                </div>
            )}

            <br/> 
            <p>
                {error ? (
                    <p>{error}</p>
                ) : userInfo ? (
                    <div>
                        <strong>안녕하세요</strong> {userInfo.nickname || userInfo.username}님
                    </div>
                ) : (
                    <p>Loading user information...</p>
                )}
            </p>

            <ChatgptApi weatherData={weatherData} />
           
        </>
    );
}

export default dashboard;