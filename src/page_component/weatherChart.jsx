import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from "chart.js";
import ChartDataLabels from 'chartjs-plugin-datalabels'; // 데이터 레이블 플러그인


import "./weatherChart.css";
import rainyIcon from '../icon/rainy.png';
import cloudyIcon from '../icon/cloudy.png';
import sunnyIcon from '../icon/sunshine.png';

import ChatgptApi from "../service/chatgptApi"



// Chart.js 구성 요소 등록
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ChartDataLabels); // 플러그인 등록


function WeatherChart({ userData }) {
    const [hourlyData, setHourlyData] = useState([]);
    const [location, setLocation] = useState({ latitude: null, longitude: null });
    const [currentWeather, setCurrentWeather] = useState(null);
    const [address, setAddress] = useState(''); // 행정동 주소를 저장할 상태

    const Weather_Key = import.meta.env.VITE_WEATHER_KEY;
    const [currentHourIndex, setCurrentHourIndex] = useState(0);
    const [airPoll, setAirPoll] = useState(null);
    const [like_hum, setLike_hum] = useState(null);
    const [sun, setSun] = useState(null);


    // 페이지 상태를 추적하는 변수 추가
    const hoursPerPage = 8; // 페이지당 시간 수
    const isFirstPage = currentHourIndex === 0;
    const isLastPage = currentHourIndex + hoursPerPage >= hourlyData.length;

    const getAddressFromCoords = (latitude, longitude) => {
        if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
            const geocoder = new window.kakao.maps.services.Geocoder();
            const coord = new window.kakao.maps.LatLng(latitude, longitude);
            geocoder.coord2RegionCode(coord.getLng(), coord.getLat(), (result, status) => {
                if (status === window.kakao.maps.services.Status.OK) {
                    const region = result.find(item => item.region_type === 'H');
                    setAddress(region ? region.address_name : '위치 정보 없음');
                } else {
                    console.error(`Geocoder Error: ${status}`);
                }
            });
        } else {
            console.error("Kakao Maps SDK가 로드되지 않았습니다.");
        }
    };


    // 위치 정보 가져오기
    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocation({ latitude, longitude });
                },
                (error) => {
                    console.error("Error getting location:", error);
                }
            );
        } else {
            console.log("Geolocation is not supported by this browser.");
        }
    }, []);

    // Kakao Maps SDK가 로드된 후 위치 정보를 기반으로 주소를 가져옴
    useEffect(() => {
        if (location && location.latitude && location.longitude) {
            getAddressFromCoords(location.latitude, location.longitude);
        } else {
            console.error("위치 정보가 없습니다:", location);
        }
    }, [location]);


    // 날씨 데이터 가져오기
    useEffect(() => {
        if (location.latitude && location.longitude) {
            const fetchWeatherData = async () => {
                try {
                    const response = await fetch(
                        `https://api.openweathermap.org/data/3.0/onecall?lat=${location.latitude}&lon=${location.longitude}&appid=${Weather_Key}&units=metric&lang=kr`
                    );
                    const data = await response.json();
                    console.log(data);

                    // 현재 날씨 정보 가져오기
                    setCurrentWeather ({
                        temp: Math.round(data.current.temp),
                        high: Math.round(data.daily[0].temp.max),
                        low: Math.round(data.daily[0].temp.min),
                        weather: data.current.weather[0].description,
                    })

                    setLike_hum ({
                        feels_like: Math.round(data.current.feels_like),
                        humidity: data.current.humidity
                    })

                    setSun( {
                        sunrise: data.current.sunrise,
                        sunset: data.current.sunset
                    })

                    //대기오염 api 가져오기 
                    const pollution_response = await fetch(
                        `http://api.openweathermap.org/data/2.5/air_pollution?lat=${location.latitude}&lon=${location.longitude}&appid=${Weather_Key}&lang=kr`
                    );
                    const pollution_data = await pollution_response.json();
                    console.log(pollution_data);
                    setAirPoll ({
                        pm2_5: Math.round(pollution_data.list[0].components?.pm2_5),
                        so2: Math.round(pollution_data.list[0].components?.so2),
                        no: Math.round(pollution_data.list[0].components?.no),
                        o3: Math.round(pollution_data.list[0].components?.o3)
                    })
                    console.log(airPoll);

                    const forecastData = data.hourly.slice(0, 24).map(hour => ({
                        time: new Date(hour.dt * 1000).toLocaleTimeString("ko-KR", {
                            hour: "numeric",
                            hour12: true,
                        }).replace('오후', '오후 ').replace('오전', '오전 '),
                        temp: Math.round(hour.temp),
                        precipitation: hour.pop * 100,
                    }));
                    setHourlyData(forecastData);
                } catch (error) {
                    console.error("Error fetching weather data:", error);
                }
            };
            fetchWeatherData();
        }
    }, [location, Weather_Key]);

    useEffect(() => {
        if (currentWeather) {
            localStorage.setItem("currentWeather", JSON.stringify(currentWeather));
        }
    }, [currentWeather, airPoll, sun, like_hum]);

    // useEffect(() => {
    //     if (airPoll) {
    //         console.log("Updated airPoll state:", airPoll);
    //     }
    // }, [airPoll])

    // useEffect(() => {
    //     if (like_hum) {
    //         console.log("Updated like_hum state:", like_hum);
    //     }
    // }, [like_hum])

    // useEffect(() => {
    //     if (sun) {
    //         console.log("Updated sun state:", sun);
    //     }
    // }, [sun])



    const handleNext = () => {
        if (currentHourIndex + hoursPerPage < hourlyData.length) {
            setCurrentHourIndex(currentHourIndex + hoursPerPage);
        }
    };


    const handlePrev = () => {
        if (currentHourIndex - hoursPerPage >= 0) {
            setCurrentHourIndex(currentHourIndex - hoursPerPage);
        }
    };

    const formattedSunrise = sun ? new Date(sun.sunrise * 1000).toLocaleTimeString("ko-KR", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
    }).replace('오후', '오후 ').replace('오전', '오전 ') : null;

    const formattedSunset = sun ? new Date(sun.sunset * 1000).toLocaleTimeString("ko-KR", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
    }).replace('오후', '오후 ').replace('오전', '오전 ') : null;


    const data = {
        labels: hourlyData.slice(currentHourIndex, currentHourIndex + hoursPerPage).map(hour => hour.time),
        datasets: [
            {
                label: "Temperature (°C)",
                data: hourlyData.slice(currentHourIndex, currentHourIndex + hoursPerPage).map(hour => hour.temp),
                borderColor: "rgba(255, 99, 132, 1)",
                backgroundColor: "rgba(255, 99, 132, 0.2)",
                pointRadius: 5,
                // 데이터 레이블 설정
                datalabels: {
                    color: 'black', // 텍스트 색상
                    anchor: 'end', // 레이블 위치
                    align: 'end', // 레이블 정렬
                    formatter: (value) => {
                        return `${value}°C`; // 표시할 텍스트
                    }
                }
            },
        ],
    };


    const options = {
        responsive: true,
        maintainAspectRatio: false, // 이 설정을 false로 하여 캔버스의 높이를 유지하지 않음
        layout: { padding: {
            top: 30,
            bottom: 30 // 하단 패딩을 크게 설정하여 그래프를 아래로 이동
        } },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: function(tooltipItem) {
                        return `${tooltipItem.dataset.label}: ${tooltipItem.parsed.y}°C`;
                    },
                },
            },
        },
        scales: {
            y: {
                display: false,
            },
            x: {
                title: {
                    display: true,
                },
                ticks: { maxRotation: 0, minRotation: 0, },
            },
        },
    };



    return (
        <div>
             <div className="current-location">
            <h4>현재 위치: {address}</h4>
        </div>


        {currentWeather && (
            <div className="current-weather">
                <h3 className="current-temp">{currentWeather.temp}°C</h3>
                <div className="weather-info">
                    <div className="temp-details">
                        <h4 className="high-low">{currentWeather.high}°C / {currentWeather.low}°C</h4>
                    </div>
                    <p className="weather-status">{currentWeather.weather}</p>
                </div>
            </div>
        )}


        <div className="chart-container">
            {!isFirstPage && <button className="prev-button" onClick={handlePrev}>&lt;</button>}
            <Line data={data} options={options} width={800} height={200} />
            {!isLastPage && <button className="next-button" onClick={handleNext}>&gt;</button>}
        </div>


        <div className="weather-chart-container">
            {hourlyData.slice(currentHourIndex, currentHourIndex + hoursPerPage).map((hour, index) => (
                <div key={index} className="weather-hour">
                    <p className="weather-hour-time">{hour.time}</p>
                    <p className="weather-hour-precipitation">{hour.precipitation}%</p>
                    <img src={
                        hour.precipitation >= 60 ? rainyIcon :
                        hour.precipitation >= 30 ? cloudyIcon : sunnyIcon} alt="강수 확률 아이콘" className="weather-hour-icon" />
                </div>
            ))}
        </div>

            <div className="weather-pollution-container">
                <p>PM2.5: {airPoll?.pm2_5}  SO2: {airPoll?.so2} NO: {airPoll?.no}  O3: {airPoll?.o3}</p>

            </div>
            <br />
            <div className="weather-feels-container">
                <p> 체감온도: {like_hum?.feels_like}</p>
                <p> 습도: {like_hum?.humidity}</p>

                <div className="weather-second-box">
                    {sun && (
                        <div className="sun-times">
                            <p>일출: {formattedSunrise}</p>
                            <p>일몰: {formattedSunset}</p>
                        </div>
                    )}

                </div>
            </div>

{currentWeather && (
                <ChatgptApi weatherData={currentWeather} userData={userData} />// currentWeather 전달
            )}
            

        </div>
    );


}


export default WeatherChart;
