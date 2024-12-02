import React from "react"
import { useState } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./sidebar";
import BottomNav from "./bottomNav";
import './header.css';

const Header = () => {
    const navigate = useNavigate()
    const location = useLocation();

    // const [isOpen, setOpen] = useState(false);
    // const [xPosition ,setxPosition] = useState(-width);

    // const handleMenuClick = (path) => {
    //     navigate(path);
    //     setxPosition(-width);
    //     setOpen(false);
    // }

    if(location.pathname === "/" || location.pathname === "/sign_up" || location.pathname === "/login") return null;

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
            {/* <Sidebar>
                    <h2 className="header-title" onClick={()=>{navigate('/dashboard')}}> All-in-Weather </h2>
                    <p className="header-nickname"> {nickname}님 <br/> 환영합니다! </p>
                    <br/>

                    <div className="header-container">
                        <p onClick={() => navigate('/myPage') }>마이 페이지</p>
                        <hr className="hr-5"/>
                        <p onClick={() => navigate('/recView')}>나의 추천 기록</p>
                        <hr className="hr-5"/>
                        <p onClick={handleLogout}>로그아웃</p>
                    </div>
            </Sidebar> */}
            <BottomNav/>
        </div>
    )
}

export default Header;