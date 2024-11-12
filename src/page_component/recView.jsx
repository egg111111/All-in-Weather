import React from "react";
import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import './recView.css'

function recView() {
    const [view, setView] = useState([]);
    const [selecteRec, setSelecteRec] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState("style"); // "style", "activity", "all" 중 하나를 선택


    const navigate = useNavigate();

    const getRecList = async () => {
        const userId = localStorage.getItem('userId');
        try {
            const response = await fetch(`http://localhost:8080/api/chat/read/${userId}`, {
                method: "GET",
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                const data = await response.json();
                setView(data);
            } else {
                console.error("Failed to fetch recommendations:", response.statusText);
            }
        } catch (error) {
            console.error("Error fetching recommendations:", error);
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

    const filteredView = view.filter((item) => {
        if (filter === "all") return true; // 전체 보기
        if (filter === "style") return item.recStyle; // 스타일만 보기
        if (filter === "activity") return item.recActivity; // 활동만 보기
        return false;
    });

    return (
        <div className="recview-back">
            <h2>추천기록</h2>

            <div className="filter-options">
            <label>
                    <input
                        type="radio"
                        value="style"
                        checked={filter === "style"}
                        onChange={() => setFilter("style")}
                    />
                    스타일
                </label>
                <label>
                    <input
                        type="radio"
                        value="activity"
                        checked={filter === "activity"}
                        onChange={() => setFilter("activity")}
                    />
                    활동
                </label>
            </div>
            <ul>
                <div className="rec_background">
                {filteredView.map((item, index) => (
                    <li key={index} 
                        onClick={() => handleDateClick(item)} 
                        style={{ cursor: "pointer", color: "blue" }}>
                        {formatDate(item.createDate)}의 기록 
                    </li>
                ))}
                </div>
            </ul>

            {showModal && selecteRec && (
                <div className="modal-background">
                    <div className="modal-content">
                        <h3>{formatDate(selecteRec.createDate)}의 기록</h3>
                        <p> 최고: {selecteRec.temp_high}℃ 최저: {selecteRec.temp_low}℃ </p>
                        <p>{selecteRec.recActivity || selecteRec.recStyle}</p>
                        <button onClick={closeModal}>Close</button>
                    </div>
                </div>
            )}
        </div>
    )
}


export default recView;