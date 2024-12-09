import React from "react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse } from "@fortawesome/free-solid-svg-icons";
import { faShirt } from "@fortawesome/free-solid-svg-icons";
import { faCalendar } from "@fortawesome/free-solid-svg-icons";
import { faBars } from "@fortawesome/free-solid-svg-icons";

import { IsNightContext } from "../service/isNight_Provider";
import { WeatherdataContext } from "../service/weatherdataProvider";
import { UserDataContext } from "../service/userDataProvider";

import ChatgptApi from "../service/chatgptApi";
import './bottomNav.css'

// library.add(faHouse, faShirt, faCalendar, faBars);

const BottomNav = () => {
    const navigate = useNavigate();
    const { isNight } = useContext(IsNightContext);
    const { currentWeather } = useContext(WeatherdataContext);
    const {userInfo} = useContext(UserDataContext)

    return (
        <nav className="BottomNav_container" style={{color: isNight ? '#BDACF6' : '#5ba3ff' }}>
            <div onClick={()=>{navigate('/dashboard')}}> <FontAwesomeIcon icon={faHouse} /> </div>
            <div > 
                {/* <FontAwesomeIcon icon={faShirt}/>  */}
                {currentWeather && (
                        <ChatgptApi weatherData={currentWeather}  userData={userInfo}/>
                    )}
            </div>
            <div> <FontAwesomeIcon icon={faCalendar} onClick={()=>{navigate('/recCalendar', { state: { userInfo } })}}/> </div>
            <div onClick={()=>{navigate('/detail')}}> <FontAwesomeIcon icon={faBars} /> </div>
        </nav>
    )
}

export default BottomNav;