import React from "react";
import { useNavigate } from "react-router-dom";
import './detailPage.css';

export const detailPage = () => {
    const navigate = useNavigate()

    if (location.pathname === "/" || location.pathname === "/sign_up" || location.pathname === "/login") return null;

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
        <div className="detailPage-container">
            <h2 className="detail-title"> All-in-Weather </h2>
            <p className="detail-nickname"> {nickname}님 <br /> 환영합니다! </p>
            <br />

            <div className="detail-container">
                <p onClick={() => navigate('/myPage')}>마이 페이지</p>
                <hr className="hr-5" />
                <p onClick={() => navigate('/recView')}>나의 추천 기록</p>
                <hr className="hr-5" />
                <p onClick={handleLogout}>로그아웃</p>
            </div>
        </div>
    )
}

export default detailPage;