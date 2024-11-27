import React, { useState, useEffect, Children, useContext } from "react";
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

import { IsNightContext } from "../service/isNight_Provider";

import { useMediaQuery } from "react-responsive";

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
import T_sunny from '/src/assets/images/weatherChart_icon/sun.gif';
import T_storm from '/src/assets/images/weatherChart_icon/storm.gif';
import T_night from '/src/assets/images/weatherChart_icon/night.gif';
import { isAction } from "redux";


// Chart.js 구성 요소 등록
ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ChartDataLabels, annotationPlugin); // 플러그인 등록


function WeatherChart({ userData }) {
    const [hourlyData, setHourlyData] = useState([]);
    const [location, setLocation] = useState({ latitude: null, longitude: null });
    const [currentWeather, setCurrentWeather] = useState(null);
    const [address, setAddress] = useState(''); // 행정동 주소를 저장할 상태
    const Weather_Key = import.meta.env.VITE_WEATHER_KEY;
    const AirQuality_Key = import.meta.env.VITE_AIR_QUALITY_KEY;
    const [currentHourIndex, setCurrentHourIndex] = useState(0);
    const [airPoll, setAirPoll] = useState(null);
    const [like_hum, setLike_hum] = useState(null);
    const [sun, setSun] = useState(null);
    const [airQuality, setAirQuality] = useState(null);

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

                    const forecastData = data.hourly.slice(0, 24).map(hour => ({
                        time: new Date(hour.dt * 1000).toLocaleTimeString("ko-KR", {
                            hour: "numeric",
                            hour12: true,
                        }).replace('오후', '오후 ').replace('오전', '오전 '),
                        temp: Math.round(hour.temp),
                        precipitation: Math.round(hour.pop * 100),
                        rain: hour.rain ? hour.rain["1h"] : 0,  // 강수량이 있을 경우 가져오고, 없으면 0으로 설정
                        snow: hour.snow ? hour.snow["1h"] : 0   // 강설량이 있을 경우 가져오고, 없으면 0으로 설정
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

    //미세먼지 가져오기(AirQuality api)
    useEffect(() => {
        const fetchAirQuality = async ()=> {
            try {
                const response = await fetch(`https://api.breezometer.com/air-quality/v2/forecast/hourly?lat=${48.857456}&lon=${2.354611}&key=${YOUR_API_KEY}&hours=3`);
                const data = await response.json();

            } catch {

            }
        }
    })

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

    //일출 일몰 구별 
    const sunriseTimestamp = sun ? sun.sunrise * 1000 : null;
    const sunsetTimestamp = sun ? sun.sunset * 1000 : null;
    localStorage.setItem('sunrise', sunriseTimestamp);
    localStorage.setItem('sunset', sunsetTimestamp);

    // 데이터 및 라벨 분리
    const beforeSunrise = hourlyData.filter(
        (hour) => new Date(hour.time).getTime() < formattedSunrise
    );
    const afterSunriseBeforeSunset = hourlyData.filter(
        (hour) =>
            new Date(hour.time).getTime() >= formattedSunrise &&
            new Date(hour.time).getTime() < formattedSunset
    );
    const afterSunset = hourlyData.filter(
        (hour) => new Date(hour.time).getTime() >= formattedSunset
    );

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
    const currentNormalized = normalizeTime(currentTime);

    const data_sun = {
        labels: ["Elapsed", "Remaining"],
        datasets: [
            {
                data: [currentNormalized, 1 - currentNormalized],
                backgroundColor: ["#FFC95C", "#D4CEFF"],
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
                            <th>미세먼지</th>
                            <th>이산화황</th>
                            <th>이산화질소</th>
                            <th> 오존 </th>
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
    const {setIsNight} = useContext(IsNightContext);

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
                <h3 className="current-location"> 📍 {address}</h3>
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
                        <p> 체감온도 {like_hum?.feels_like}</p>
                        <p> 습도 {like_hum?.humidity}</p>
                        {/* </div> */}
                    </div>
                )}

                <div className="chart-container">
                    {!isFirstPage && <button className="prev-button" onClick={handlePrev}>&lt;</button>}

                    <div className="line-chart">
                        <Line data={data} options={options} />
                    </div>

                    {!isLastPage && <button className="next-button" onClick={handleNext}>&gt;</button>}

                    <div className="weather-chart-container">
                        {hourlyData.slice(currentHourIndex, currentHourIndex + hoursPerPage).map((hour, index) => (
                            <div key={index} className="weather-hour">
                                <p className="weather-hour-precipitation">{hour.precipitation}%</p>
                                <img
                                    src={
                                        hour.precipitation >= 60 ? rainyIcon :
                                            hour.precipitation >= 30 ? cloudyIcon : sunnyIcon
                                    }
                                    alt="강수 확률 아이콘"
                                    className="weather-hour-icon"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="chatgpt-button">
                    {currentWeather && (
                        <ChatgptApi weatherData={currentWeather} userData={userData} />
                    )}
                </div>
                <br />

            </div>

            <div>
                {currentWeather && <RecommendItem weatherData={currentWeather} hourlyData={hourlyData} />}
            </div>

            <br />

            <Collapse
                bordered={false}
                defaultActiveKey={['0']}
                expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}

                items={getItems(panelStyle)}
            />

        </div>
    );
}

export default WeatherChart;

