import React from "react";
import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";

function recView() {
    const [view, setView] = useState([]);
    const [selecteRec, setSelecteRec] = useState(null);
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
    }

    return (
        <>
            <h2>기록</h2>
            <ul>
                {view.map((rec, index) => (
                    <li key={index}>
                        {rec.createDate}
                        <br/>
                        {rec.recommendation} {/* 날짜와 추천 내용을 출력 */}
                    </li>
                ))}
            </ul>
            <button onClick={() => { navigate('/recList'); }}>돌아가기</button>
        </>
    )
}

export default recView;