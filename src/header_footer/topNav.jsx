import React from "react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

import { IsNightContext } from "../service/isNight_Provider";

import './topNav.css';

const TopNav = () => {
    const navigate = useNavigate();
    const { isNight } = useContext(IsNightContext);
    const title = useSelector((state) => state.title.title)

    return (
        <nav className="TopNav_container"  style={{color: isNight ? '#BDACF6' : '#5ba3ff' }}>
            <div><FontAwesomeIcon icon={faArrowLeft} onClick={() => {navigate(-1)}}/></div>
            <p className="TopNav_text"> {title} </p>
            <p className="TopNav_title" onClick={() => {navigate('/dashboard')}}>AiW</p>
        </nav>
    )
}

export default TopNav;