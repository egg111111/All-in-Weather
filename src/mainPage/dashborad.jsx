import React from "react";
import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import './dashbaord.css';

function dashboard() {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [username, setUsername] = useState("");
    //const username = localStorage.getItem('username');

    //username 가져오기 
    useEffect(() => {
        async function fetchUsername() {
            const userId = localStorage.getItem('userId'); 
            try {
                const response = await fetch(`http://localhost:8080/api/users/show/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setUsername(data.username); // 서버에서 받아온 username
                } else {
                    console.error("Failed to fetch username");
                }
            } catch (error) {
                console.error("Error fetching username:", error);
            }
        }

        fetchUsername();
    }, []);

    function handleClick() {
        navigate('/myPage');
        setIsMenuOpen(false);
    }

    function handleLogout() {
        localStorage.removeItem('token');
        console.log('로그아웃 성공');
        navigate('/')
    }

    const toggleMenu = () => {
        setIsMenuOpen((props) => !props);
    };

    return (
        <>
            <h1> 여기 날씨 api </h1>
            
            <button className="hamburger" onClick={toggleMenu}>
                {isMenuOpen ? '✖️' : '☰'} 
            </button>

            {isMenuOpen && (
                <div className="menu">
                    <button onClick={handleClick}>마이 페이지</button>
                    <br></br>
                    <button onClick={handleLogout}>로그아웃</button>
                </div>
            )}

            <br/>

            <button> 옷차림 추천 </button>
            <button> 활동 추천 </button>
            <button> 준비물 추천 </button>
            <p>{username} 님 안녕하세요! </p>
        </>
    );
}

export default dashboard;