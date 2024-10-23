import React from "react";
import { json } from "react-router-dom";

function WeatherOpenApi (){
    const API_KEY = '819890026bf9aab1c43f4ee2ba683f4c';

    const getWether = () => {
        const lat = parseFloat(localStorage.getItem("latitude"));
        const lon = parseFloat(localStorage.getItem("longitude"));
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`)
        .then((response) => {
            return response.json();
        })
        .then((json) => {
            const weatherData = {
                temp: json.main.temp,
                place: json.name,
                description: json.weather[0].main
            }
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

    return(
        <>
        <div>
            <button onClick={getWether}>Button</button>
            <form>
                <h3> 기온 </h3>
                <h3> 위치 </h3>
                <h3> 설명 </h3>
            </form>
        </div>
        </>
    )
}

export default WeatherOpenApi;