import React from "react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse } from "@fortawesome/free-solid-svg-icons";
import { faShirt } from "@fortawesome/free-solid-svg-icons";
import { faCalendar } from "@fortawesome/free-solid-svg-icons";
import { faBars } from "@fortawesome/free-solid-svg-icons";

import { IsNightContext } from "../service/isNight_Provider";
import './bottomNav.css'

// library.add(faHouse, faShirt, faCalendar, faBars);

const BottomNav = () => {
    const navigate = useNavigate();
    const { isNight } = useContext(IsNightContext);

    return (
        <nav className="Nav_container" style={{color: isNight ? '#BDACF6' : '#5ba3ff' }}>
            <div > <FontAwesomeIcon icon={faShirt}/> </div>
            <div> <FontAwesomeIcon icon={faCalendar} /> </div>
            <div onClick={()=>{navigate('/dashboard')}}> <FontAwesomeIcon icon={faHouse} /> </div>
            <div onClick={()=>{navigate('/detail')}}> <FontAwesomeIcon icon={faBars} /> </div>
        </nav>
    )
}

export default BottomNav;