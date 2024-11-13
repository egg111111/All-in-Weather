import React from "react"
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./sidebar";

const Header = () => {
    const navigate = useNavigate()
    const location = useLocation();

    if(location.pathname === "/" || location.pathname === "/sign_up" || location.pathname === "/login") return null;

    function handleLogout() {
        localStorage.removeItem('token');
<<<<<<< HEAD
        localStorage.removeItem('name');
        localStorage.removeItem('nickname');
        localStorage.removeItem('social_userId');
        localStorage.removeItem('social_username');
=======
>>>>>>> 9207541e5f044c8bbc0c9160ef8f8c4d9a2f76cd
        console.log('로그아웃 성공');
        navigate('/')
    }

    return (
        <div>
            <Sidebar>
                <div>
                    <h2 onClick={()=>{navigate('/dashboard')}}> Weather-in-All </h2>
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