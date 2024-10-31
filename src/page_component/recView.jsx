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