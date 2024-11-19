import React from "react";
import { json } from "react-router-dom";

function WeatherOpenApi (){
    const Weather_Key = import.meta.env.VITE_WEATHER_KEY;

    const getWether = () => {
        const lat = parseFloat(localStorage.getItem("latitude"));
        const lon = parseFloat(localStorage.getItem("longitude"));
        fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${Weather_Key}`)
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