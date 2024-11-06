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



// Chart.js 구성 요소 등록
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ChartDataLabels); // 플러그인 등록


function WeatherChart({ onSetCurrentWeather }) {
    const [hourlyData, setHourlyData] = useState([]);
    const [location, setLocation] = useState({ latitude: null, longitude: null });
    const [currentWeather, setCurrentWeather] = useState(null);
    const Weather_Key = import.meta.env.VITE_WEATHER_KEY;
    const [currentHourIndex, setCurrentHourIndex] = useState(0);
    const [airPoll, setAirPoll] = useState(null);
    const [like_hum, setLike_hum] = useState(null);
    const [sun, setSun] = useState(null);


    // 페이지 상태를 추적하는 변수 추가
    const hoursPerPage = 8; // 페이지당 시간 수
    const isFirstPage = currentHourIndex === 0;
    const isLastPage = currentHourIndex + hoursPerPage >= hourlyData.length;


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
                    const newCurrentWeather = {
                        temp: Math.round(data.current.temp),
                        high: Math.round(data.daily[0].temp.max),
                        low: Math.round(data.daily[0].temp.min),
                        weather: data.current.weather[0].description,
                    };
                    setCurrentWeather(newCurrentWeather);

                    const feels_humidity = {
                        feels_like: Math.round(data.current.feels_like),
                        humidity: data.current.humidity
                    }
                    setLike_hum(feels_humidity);

                    const sunrise_set = {
                        sunrise: data.current.sunrise,
                        sunset: data.current.sunset
                    }
                    setSun(sunrise_set);

                    //대기오염 api 가져오기 
                    const pollution_response = await fetch(
                        `http://api.openweathermap.org/data/2.5/air_pollution?lat=${location.latitude}&lon=${location.longitude}&appid=${Weather_Key}&lang=kr`
                    );
                    const pollution_data = await pollution_response.json();
                    console.log(pollution_data);
                    const airPollution = {
                        pm2_5: Math.round(pollution_data.list[0].components.pm2_5),
                        so2: Math.round(pollution_data.list[0].components.so2),
                        no: Math.round(pollution_data.list[0].components.no),
                        o3: Math.round(pollution_data.list[0].components.o3)
                    };
                    setAirPoll(airPollution);
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
    }, [currentWeather, airPoll]);


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
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: function (tooltipItem) {
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
                    text: "시간",
                },
            },
        },
    };


    return (
        <div>
            {currentWeather && (
                <div className="current-weather">
                    <h3 className="current-temp">{currentWeather.temp}°C</h3>
                    <div className="weather-info">
                        <div className="temp-details">
                            <h4 className="high-low">
                                {currentWeather.high}°C, / {currentWeather.low}°C
                            </h4>
                        </div>
                        <p className="weather-status">{currentWeather.weather}</p>
                    </div>
                </div>
            )}
            <div className="chart-container">
                <Line data={data} options={options} width={600} height={300} />
                <div className="temperature-labels"></div>
                {!isFirstPage && (
                    <button className="next-button" onClick={handlePrev}>&lt;</button>
                )}
                {!isLastPage && (
                    <button className="next-button" onClick={handleNext}>&gt;</button>
                )}
            </div>
            <div className="weather-chart-container">
                {hourlyData.slice(currentHourIndex, currentHourIndex + hoursPerPage).map((hour, index) => (
                    <div key={index} className="weather-hour">
                        <p className="weather-hour-time">{hour.time}</p>
                        <p className="weather-hour-precipitation">{hour.precipitation}%</p>
                        <img
                            src={hour.precipitation > 50 ? rainyIcon : cloudyIcon}
                            alt="강수 확률 아이콘"
                            className="weather-hour-icon"
                        />
                    </div>
                ))}
            </div>
            <div className="weather-pollution-container">
                <p>PM2.5: {airPoll.pm2_5} SO2: {airPoll.so2} NO: {airPoll.no} O3: {airPoll.o3}</p>
            
            </div>

            <div>
                <p> {like_hum.feels_like} {like_hum.humidity}</p>
            </div>
        </div>
    );


}


export default WeatherChart;
