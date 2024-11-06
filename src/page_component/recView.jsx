import React from "react";
import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import './recView.css'

function recView() {
    const [view, setView] = useState([]);
    const [selecteRec, setSelecteRec] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    const getRecList = async () => {
        const userId = localStorage.getItem('userId');
        const username = localStorage.getItem('social_username');
        try {
            let response;
            // 일반 로그인일 경우
            if (userId) {
                response = await fetch(`http://localhost:8080/api/chat/read/${userId}`, {
                    method: "GET",
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setView(data);
                }
            }
            else {
                response = await fetch(`http://localhost:8080/api/chat/read/social/${username}`, {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include', // JWT 쿠키를 전송
                });
                if (response.ok) {
                    const data = await response.json();
                    setView(data);
                }
            }
        } catch (error) {
            console.error("사용자 정보 가져오기 중 오류:", error);
        }
    }
  
    useEffect(() => {
        getRecList();
    }, [])

    const handleDateClick = (item) => {
        setSelecteRec(item);
        setShowModal(true);
    }

    const closeModal = () => {
        setShowModal(false);
        setSelecteRec(null);
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const month = date.getMonth() +1;
        const day = date.getDate();
        const hours = date.getHours();
        const minutes = date.getMinutes().toString();
        return `${month}월 ${day}일 ${hours}시 ${minutes}분`;
    }

    return (
        <>
            <h2>추천기록</h2>
            <ul>
                {view.map((item, index) => (
                    <li key={index} onClick={() => handleDateClick(item)} style={{ cursor: "pointer", color: "blue" }}>
                        {formatDate(item.createDate)}의 기록 
                    </li>
                ))}
            </ul>

            {showModal && selecteRec && (
                <div className="modal-background">
                    <div className="modal-content">
                        <h3>{formatDate(selecteRec.createDate)}의 기록</h3>
                        <p>{selecteRec.recommendation}</p>
                        <button onClick={closeModal}>Close</button>
                    </div>
                </div>
            )}
        </>
    )
}


export default recView;