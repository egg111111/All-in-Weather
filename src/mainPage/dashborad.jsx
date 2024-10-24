import React from "react";
import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import ChatgptApi from "../service/chatgptApi";
import './dashbaord.css';
import { DiMagento } from "react-icons/di";

function dashboard() {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [username, setUsername] = useState("");
    //const username = localStorage.getItem('username');
    const [location, setLocation] = useState({ latitude: null, longitude: null });
    const [locationStatus, setLocationStatus] = useState("위치 정보 불러오는 중...");
    const [weatherData, setWeather] = useState("");

    //username 가져오기 
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
                    getWeather(latitude, longitude);
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

    //사용자의 위치 정보가 로컬에 있으면 위험하니까 대시보드에서 전부 처리 
    //openWeatherMap API 로직 
    const getWeather = (latitude, longitude) => {
        const iconSection = document.querySelector('.icon');
        const Weather_Key = import.meta.env.VITE_WEATHER_KEY;
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${Weather_Key}&units=metric&lang=kr`)
        .then((response) => {
            return response.json();
        })
        .then((json) => {
            const weatherData = {
                temp: json.main.temp,
                place: json.name,
                description: json.weather[0].description
            };
            const icon = json.weather[0].icon;
            const iconURL = `http://openweathermap.org/img/wn/${icon}@2x.png`;
            iconSection.setAttribute('src', iconURL);
            setWeather(weatherData);
            console.log(json);
            console.log(weatherData);
        })
        .catch((error)=>{
            console.error('Error: ', error);
        })
    }

    //서버로 정보 보내기 
    const sendWeatherPost = (data) =>{
        fetch('http://localhost:8080/api/weahter', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }, 
            body: JSON.stringify(data)
        })
        .then((response) => {
            if(response.ok){
                console.log('sccuess');
            } else{
                console.error('fail');
            }
        })
        .catch((error) => {
            console.error('Error sending data to backend:', error);
        })
    }


    //핸들러 로직
    function handleClick() {
        navigate('/myPage');
        setIsMenuOpen(false);
    }

    function handleLogout() {
        localStorage.removeItem('token');
        console.log('로그아웃 성공');
        navigate('/')
    }

    const toggleMenu = () => {
        setIsMenuOpen((props) => !props);
    };

    //Gpt 호출 로직 
    const handleCall_GPT = async() => {
        ChatgptApi();
    }

    return (
        <>  <div className="weather" >
                <img className="weather_icon" class="icon"></img>
                <h2> {weatherData.temp}°C </h2>
                <p> {weatherData.place} </p>
                <p> {weatherData.description} </p>
            </div>
            
            <button className="hamburger" onClick={toggleMenu}>
                {isMenuOpen ? '✖️' : '☰'} 
            </button>

            {isMenuOpen && (
                <div className="menu">
                    <button onClick={handleClick}>마이 페이지</button>
                    <br></br>
                    <button onClick={handleLogout}>로그아웃</button>
                </div>
            )}

            <br/>

            {/* <button> 옷차림 추천 </button> */}
            <button> 활동 추천 </button>
            <button> 준비물 추천 </button>
            <ChatgptApi></ChatgptApi>
            <p>{username} 님 안녕하세요! </p>
        </>
    );
}

export default dashboard;