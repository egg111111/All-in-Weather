import React from "react"
import { Navigate, useNavigate } from "react-router-dom";
import Sidebar from "./sidebar";

const Header = () => {
    const navigate = useNavigate()

    function handleLogout() {
        localStorage.removeItem('token');
        console.log('로그아웃 성공');
        navigate('/')
    }

    return (
        <div>
            <Sidebar>
                <div className="menu">
                    <button onClick={() => { navigate('/myPage'); }}>마이 페이지</button>
                    <br />
                    <button onClick={() => { navigate('/recView'); }}>나의 추천 기록</button>
                    <br />
                    <button onClick={handleLogout}>로그아웃</button>
                </div>
            </Sidebar>
        </div>
    )
}

export default Header;