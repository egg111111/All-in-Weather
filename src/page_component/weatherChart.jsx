import React, { useState, useEffect, useContext, createContext } from "react";
import { Line, Doughnut } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    elements,
} from "chart.js";
import ChartDataLabels from 'chartjs-plugin-datalabels'; // 데이터 레이블 플러그인
import { Collapse, theme } from "antd";
import { CaretRightOutlined } from '@ant-design/icons';
import ChatgptApi from "../service/chatgptApi"; import annotationPlugin from "chartjs-plugin-annotation";
//아이콘 가져오기 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { faDroplet } from "@fortawesome/free-solid-svg-icons";
import { faTemperatureHalf } from "@fortawesome/free-solid-svg-icons";
import { faStarOfLife } from "@fortawesome/free-solid-svg-icons";
import { faVirus } from "@fortawesome/free-solid-svg-icons";
import { faCertificate } from "@fortawesome/free-solid-svg-icons";
import { faSunPlantWilt } from "@fortawesome/free-solid-svg-icons";
import { faUmbrella } from "@fortawesome/free-solid-svg-icons";
// ---
import { useMediaQuery } from "react-responsive";

import { IsNightContext } from "../service/isNight_Provider";
import { WeatherdataContext } from "../service/weatherdataProvider";

import weatherDescKo from "../service/weatherDescKo";
import "./weatherChart.css";
import rainyIcon from '../icon/rainy.png';
import cloudyIcon from '../icon/cloudy.png';
import sunnyIcon from '../icon/sunshine.png';
import RecommendItem from "../service/RecommendItem";

import T_clounds from '/src/assets/images/weatherChart_icon/clouds.gif';
import T_clouys from '/src/assets/images/weatherChart_icon/cloudy.gif';
import T_rain from '/src/assets/images/weatherChart_icon/rain.gif';
import T_snow from '/src/assets/images/weatherChart_icon/snow.gif';
import T_sunny from '/src/assets/images/weatherChart_icon/sun_1.gif';
import T_storm from '/src/assets/images/weatherChart_icon/storm.gif';
import T_night from '/src/assets/images/weatherChart_icon/night.gif';

//미세먼지 아이콘 
import rowIcon from '/src/assets/images/pm2_5/low.png';
import basicIcon from '/src/assets/images/pm2_5/basic.png';
import highIcon from '/src/assets/images/pm2_5/high.png';
import fullIcon from '/src/assets/images/pm2_5/full-high.png';

// Chart.js 구성 요소 등록
ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ChartDataLabels, annotationPlugin); // 플러그인 등록


function WeatherChart({ userData }) {
    const [hourlyData, setHourlyData] = useState([]);
    const [location, setLocation] = useState({ latitude: null, longitude: null });
    // const [currentWeather, setCurrentWeather] = useState(null);
    const { currentWeather, setCurrentWeather } = useContext(WeatherdataContext);
    const [address, setAddress] = useState(''); // 행정동 주소를 저장할 상태
    const Weather_Key = import.meta.env.VITE_WEATHER_KEY;
    const AirQuality_Key = import.meta.env.VITE_AIR_QUALITY_KEY;
    const [currentHourIndex, setCurrentHourIndex] = useState(0);
    const [airPoll, setAirPoll] = useState(null);
    const [like_hum, setLike_hum] = useState(null);
    const [sun, setSun] = useState(null);
    const [uvIndex, setUvIndex] = useState(null); // UV Index 상태 추가
    const [hourlyPm2_5, setHourlyPm2_5] = useState([]); //미세먼지를 저장할 상태 
    const [currentView, setCurrentView] = useState("rain");

    const isMobile = useMediaQuery({ query: "(max-width:474px)" });
    const isTablet = useMediaQuery({ query: "(min-witdh:475px) and (max-witdh:768px)" })


    // 페이지 상태를 추적하는 변수 추가
    let hoursPerPage = 8; // 페이지당 시간 수
    const isFirstPage = currentHourIndex === 0;
    const isLastPage = currentHourIndex + hoursPerPage >= hourlyData.length;
    if (isMobile) {
        hoursPerPage = 4;
    } else if (isTablet) {
        hoursPerPage = 6;
    }

    // Kakao Maps SDK 로드
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

                    // 위치 정보 서버로 전송
                    sendLocationToServer(latitude, longitude);
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


    // 서버로 위치 정보 전송
    const sendLocationToServer = (latitude, longitude) => {
        const userId = userData.userId; // 사용자 ID
        fetch('http://localhost:8080/api/location', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                latitude,
                longitude,
            }),
        })
            .then(response => response.json())
            .then(data => {
                console.log('Location saved:', data);
            })
            .catch((error) => {
                console.error('Error sending location to server:', error);
            });
    };



    // 날씨 데이터 가져오기
    useEffect(() => {
        if (location.latitude && location.longitude) {
            const fetchWeatherData = async () => {
                try {
                    const response = await fetch(
                        `https://api.openweathermap.org/data/3.0/onecall?lat=${location.latitude}&lon=${location.longitude}&appid=${Weather_Key}&units=metric&lang=kr`
                    );
                    const data = await response.json();// 현재 날씨 정보 가져오기


                    console.log(data)
                    setCurrentWeather({
                        temp: Math.round(data.current.temp),
                        high: Math.round(data.daily[0].temp.max),
                        low: Math.round(data.daily[0].temp.min),
                        id: data.current.weather[0].id,
                        weather: weatherDescKo[data.current.weather[0].id] || "알 수 없는 날씨",
                    });

                    setLike_hum({
                        feels_like: Math.round(data.current.feels_like),
                        humidity: data.current.humidity
                    })

                    setSun({
                        sunrise: data.current.sunrise,
                        sunset: data.current.sunset
                    })

                    setUvIndex(data.current.uvi); // UV Index 설정

                    //대기오염 api 가져오기 
                    const pollution_response = await fetch(
                        `http://api.openweathermap.org/data/2.5/air_pollution?lat=${location.latitude}&lon=${location.longitude}&appid=${Weather_Key}&lang=kr`
                    );
                    const pollution_data = await pollution_response.json();
                    console.log(pollution_data);
                    setAirPoll({
                        pm2_5: Math.round(pollution_data.list[0].components?.pm2_5),
                        so2: Math.round(pollution_data.list[0].components?.so2),
                        no: Math.round(pollution_data.list[0].components?.no),
                        o3: Math.round(pollution_data.list[0].components?.o3)
                    })
                    console.log(airPoll);

                    const forecastData = data.hourly.slice(0, 24).map((hour) => {
                        const hourDate = new Date(hour.dt * 1000);
                        return {
                            date: hourDate,
                            time: hourDate.toLocaleTimeString("ko-KR", {
                                hour: "numeric",
                                hour12: true,
                            }).replace("오후", "오후 ").replace("오전", "오전 "),
                            temp: Math.round(hour.temp),
                            precipitation: Math.round(hour.pop * 100),
                            rain: hour.rain ? hour.rain["1h"] : 0,  // 강수량이 있을 경우 가져오고, 없으면 0으로 설정
                            snow: hour.snow ? hour.snow["1h"] : 0,   // 강설량이 있을 경우 가져오고, 없으면 0으로 설정
                        };
                    });
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

    //미세먼지 가져오기(openWeahterMap)
    const fetchAirQuality = async () => {

        try {
            const response = await fetch(
                `http://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${location.latitude}&lon=${location.longitude}&appid=${Weather_Key}`
            );
            const data = await response.json();
            console.log("Air:", data);

            const forecastPm2_5 = data.list.slice(0, 24).map((hourAir) => {
                const hourDate = new Date(hourAir.dt * 1000);
                return {
                    date: hourDate,
                    time: hourDate.toLocaleTimeString("ko-kr", {
                        hour: "numeric",
                        hour12: true,
                    }).replace("오후", "오후").replace("오전", "오전"),
                    pm2_5: hourAir.components.pm2_5
                };
            })

            setHourlyPm2_5(forecastPm2_5);
            console.log(hourlyPm2_5);

        } catch (error) {
            console.error("Error fetching air quality data:", error);
        }
    };

    useEffect(() => {
        fetchAirQuality();
    }, [location]);

    //일출 일몰 구별 
    const sunriseTimestamp = sun ? sun.sunrise * 1000 : null;
    const sunsetTimestamp = sun ? sun.sunset * 1000 : null;

    //미세먼지 기준 구분
    function PM_standard(pm) {
        var pm_string;
        if (pm <= 30) {
            pm_string = "좋음";
        } else if (pm > 30 && pm <= 80) {
            pm_string = "보통";
        } else if (pm > 80 && pm <= 150) {
            pm_string = "나쁨";
        } else {
            pm_string = "매우 나쁨"
        }
        return pm_string;
    }

    function PM_Icon(pm) {
        if (pm <= 30) {
            return rowIcon;
        } else if (pm > 30 && pm <= 80) {
            return basicIcon;
        } else if (pm > 80 && pm <= 150) {
            return highIcon;
        } else {
            return fullIcon;
        }
    }

    const toggleView = () => {
        setCurrentView((prev) => (prev === "rain" ? "pm2_5" : "rain"));
    }


    const data = {
        labels: hourlyData
            .slice(currentHourIndex, currentHourIndex + hoursPerPage)
            .map(hour => hour?.time || "Unknown"),  // hour가 정의되지 않은 경우 "Unknown" 표시
        datasets: [
            {
                label: "Temperature (°C)",
                data: hourlyData
                    .slice(currentHourIndex, currentHourIndex + hoursPerPage)
                    .map(hour => hour?.temp || null),  // hour가 정의되지 않은 경우 null로 설
                backgroundColor: "rgba(255, 99, 132, 0.2)",
                pointRadius: 5,
                datalabels: {
                    color: 'black',
                    anchor: 'end',
                    align: 'end',
                    formatter: (value) => `${value}°C`
                }
            },
        ],
    };


    const options = {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: {
                top: 30,
                bottom: 0,
            },
        },
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
                font: {
                    family: "'NEXON Lv2 Gothic'",
                }
            },
        },
        scales: {
            y: {
                display: false,
            },
            x: {
                grid: {
                    display: false,
                },
                title: {
                    display: false,
                },
                ticks: { maxRotation: 0, minRotation: 0 },
            },
        },
    };

    //일출 관련 그래프 
    const normalizeTime = (time) => {
        if (time < sunriseTimestamp) return 0; // 일출 전
        if (time > sunsetTimestamp) return 1; // 일몰 후
        return (time - sunriseTimestamp) / (sunsetTimestamp - sunriseTimestamp);
    };

    const currentTime = new Date().getTime(); // 현재 시각 (밀리초)
    const currentTime_air = new Date();
    const currentNormalized = normalizeTime(currentTime);

    const data_sun = {
        labels: ["Elapsed", "Remaining"],
        datasets: [
            {
                data: [currentNormalized, 1 - currentNormalized],
                backgroundColor: ["#D4CEFF", "#FFC95C"],
                borderWidth: 1,
            },
        ],
    };

    const formatTime = (time) => {
        const date = new Date(time);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const period = hours >= 12 ? "오후" : "오전";

        // 12시간제 변환
        const formattedHours = hours % 12 || 12;
        const formattedMinutes = minutes.toString().padStart(2, "0");

        return `${period} ${formattedHours}시 ${formattedMinutes}분`;
    };

    const options_sun = {
        responsive: false,
        rotation: -90, // 시작 각도 (위쪽)
        circumference: 180, // 반원
        cutout: "90%", // 굵기 조절
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                enabled: false,
                font: {
                    family: "NEXON Lv2 Gothic",
                }
            },
            datalabels: {
                display: false,
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    // maxRotation: 45, // 최대 회전 각도
                    callback: (value, index) => {
                        if (index === 0) return formatTime(sunriseTimestamp); // 시작(일출 시간)
                        if (index === 1) return formatTime(sunsetTimestamp); // 끝(일몰 시간)
                        return ""; // 중간 값 생략
                    },
                },
            },
        },
        layout: {
            padding: {
                top: 10,
                bottom: 10,
            },
        },
    };

    //Collapse 사용 
    const getItems = (panelStyle) =>
        [
            {
                key: '1',
                label: '대기오염',
                children:
                    <div className="weather-pollution-container">
                        <table className="pollution-table">
                            <th> <FontAwesomeIcon icon={faStarOfLife} /> 미세먼지 </th>
                            <th> <FontAwesomeIcon icon={faVirus} /> 이산화황 </th>
                            <th><FontAwesomeIcon icon={faCertificate} /> 이산화질소 </th>
                            <th><FontAwesomeIcon icon={faSunPlantWilt} /> 오존 </th>
                            <tr>
                                <td>{PM_standard(airPoll?.pm2_5)} ({airPoll?.pm2_5}) </td>
                                <td>{airPoll?.so2}</td>
                                <td>{airPoll?.no}</td>
                                <td> {airPoll?.o3}</td>
                            </tr>
                        </table>
                    </div>,
                style: panelStyle,
            },
            {
                key: '2',
                label: '일출 일몰',
                children: <div className="sun_Doughnut" >
                    <Doughnut data={data_sun} options={options_sun} />
                </div>,
                style: panelStyle,
            },
        ];

    const panelStyle = {
        border: '1px',
        background: '#ffffff',
        borderRadius: '5px'
    };

    const weatherIcon_Map = (weather_Id) => {
        if (weather_Id >= 200 && weather_Id < 300) {
            return T_storm;
        } else if (weather_Id >= 300 && weather_Id < 600) {
            return T_rain;
        } else if (weather_Id >= 600 && weather_Id < 700) {
            return T_snow;
        } else if (weather_Id >= 700 && weather_Id < 800) {
            return T_clounds;
        } else if (weather_Id == 800) {
            if (currentTime < sunriseTimestamp || currentTime > sunsetTimestamp) {
                return T_night;
            }
            else {
                return T_sunny;
            }
        } else if (weather_Id >= 800 && weather_Id < 900) {
            return T_clouys;
        }
    }

    //일출/일몰에 맞춰서 배경 바꾸기 
    //여기서 나온 값을 context Api를 사용해서 App으로 보냄 
    //0: 낮 1: 밤
    const { setIsNight } = useContext(IsNightContext);

    const day_night = () => {
        return currentTime < sunriseTimestamp || currentTime > sunsetTimestamp
            ? true
            : false;
    };

    useEffect(() => {
        setIsNight(day_night());
    }, [currentTime, setIsNight]);

    return (
        <div className="weatherChart-container">
            <div className="first-container">
                <h3 className="current-location"> <FontAwesomeIcon icon={faLocationDot} /> {address}</h3>
                {currentWeather && (
                    <div className="current-weather">

                        <img src={weatherIcon_Map(currentWeather.id)}
                            alt="Weather Icon"
                            className="weather-icon" />
                        <div className="weather-info">
                            <h3 className="current-temp">{currentWeather.temp}°C</h3>
                            <div className="temp-details">
                                <h4 className="high-low">{currentWeather.high}°C / {currentWeather.low}°C</h4>
                            </div>
                            <p className="weather-status">{currentWeather.weather}</p>
                        </div>

                        {/* <div className="weather-feels-container"> */}
                        <p> <FontAwesomeIcon icon={faTemperatureHalf} /> 체감온도 {like_hum?.feels_like}</p>
                        <p> <FontAwesomeIcon icon={faDroplet} /> 습도 {like_hum?.humidity}</p>
                        {/* </div> */}
                    </div>
                )}

                <div className="chart-container">

                    <button onClick={toggleView} className="toggle-view-button">
                        {currentView === "rain" ? <p> <FontAwesomeIcon icon={faUmbrella} /> 강수량</p> : <p> <FontAwesomeIcon icon={faStarOfLife} /> 미세먼지 </p>}
                    </button>
                    {!isFirstPage && <button className="prev-button" onClick={handlePrev}>&lt;</button>}

                    <div className="line-chart">
                        <Line data={data} options={options} />
                    </div>

                    {!isLastPage && <button className="next-button" onClick={handleNext}>&gt;</button>}

                    {currentView === "rain" && (
                        <div className="weather-chart-container">
                            {hourlyData.slice(currentHourIndex, currentHourIndex + hoursPerPage).map((hour, index) => (
                                <div key={index} className="weather-hour">
                                    <img
                                        src={
                                            hour.precipitation >= 60 ? rainyIcon :
                                                hour.precipitation >= 30 ? cloudyIcon : sunnyIcon
                                        }
                                        alt="강수 확률 아이콘"
                                        className="weather-hour-icon"
                                    />
                                    <p className="weather-hour-precipitation">{hour.precipitation}%</p>
                                </div>
                            ))}
                            <br />
                        </div>
                    )}

                    {currentView === "pm2_5" && (
                        <div className="weather-pm2_5-container">
                            {hourlyPm2_5.slice(currentHourIndex, currentHourIndex + hoursPerPage).map((hourAir, index) => (
                                <div key={index} className="weather-pm2_5">

                                    {/* <p className="weather-hour-all-pm2_5"> {hourAir.pm2_5}</p> */}
                                    <img className="weather-pm2_5-icon" src={PM_Icon(hourAir.pm2_5)} />
                                    <p className="weahter-hour-pm2_5-text"> {PM_standard(hourAir.pm2_5)} </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <br />

            </div>

            <div>
                {currentWeather && <RecommendItem weatherData={currentWeather} hourlyData={hourlyData} />}
            </div>

            <br />

            <div className="collapse-content">
                <Collapse
                    bordered={false}
                    defaultActiveKey={['0']}
                    expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}

                    items={getItems(panelStyle)}
                />
            </div>

        </div>
    );
}

export default WeatherChart;

export const useWeather = () => useContext(WeatherdataContext);