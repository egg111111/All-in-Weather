import React from "react";
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;

function recommendation_note() {
    const [recList, setRecList] = useState([]);
    const navigate = useNavigate();

    //recommdation에서 값 가져오기
    const getRecList = async () => {
        const userId = localStorage.getItem('userId');
        try {
            const response = await fetch(`${API_URL}/api/chat/read/${userId}`, {
                method: "GET",
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                const data = await response.json();
                setRecList(data);
            } else {
                console.error("Failed to fetch recommendations:", response.statusText);
            }
        } catch (error) {
            console.error("Error fetching recommendations:", error);
        }
    }

    useEffect(() => {
        getRecList();
    }, []);

    function handleCLick(){
        navigate('/myPage');
    }

    return (
        <>
            <h2> 추천 기록 </h2>
            <ul onClick={() => { navigate('/recView'); }}>
                {recList.map((rec, index) => (
                    <li key={index}>
                        {rec.createDate} 기록 
                    </li>
                ))}
            </ul>
        </>
    )
}

export default recommendation_note;