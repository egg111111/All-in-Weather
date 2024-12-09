import React from "react"
import { useState } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import BottomNav from "./bottomNav";
import TopNav from "./topNav";
import './header.css';

const Header = () => {
    const navigate = useNavigate()
    const location = useLocation();

    if(location.pathname === "/" || 
        location.pathname === "/sign_up" || 
        location.pathname === "/login" || 
        location.pathname === "/addUserInfo" ||
        location.pathname === "/preference"
    ) return null;

    function handleLogout() {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('tokenExpiry');
        localStorage.removeItem('name');
        localStorage.removeItem('nickname');
        localStorage.removeItem('social_userId');
        localStorage.removeItem('social_username');
        localStorage.removeItem('userId');
        console.log('로그아웃 성공');
        navigate('/')
    }

    //닉네임 가져오기 
    const nickname = localStorage.getItem('nickname');

    return (
        <div>
            <TopNav/>
            <BottomNav/>
        </div>
    )
}

export default Header;