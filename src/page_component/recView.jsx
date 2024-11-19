import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './recView.css'
const API_URL = import.meta.env.VITE_API_URL;

function recView() {
    const [view, setView] = useState([]);
    const [selecteRec, setSelecteRec] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState("style");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedWeek, setSelectedWeek] = useState(1);
    const [weeks, setWeeks] = useState([]);
    const itemPerPage = 7;

    const navigate = useNavigate();

    const getRecList = async () => {
        const userId = localStorage.getItem('userId');
        const social_userId = localStorage.getItem('social_userId');
        const UserId = userId || social_userId; // userId 또는 social_userId를 동적으로 선택

        if (!UserId) {
            console.error("userId와 social_userId 중 하나가 필요합니다.");
            return;
        }

        try {
            const fetchOptions = {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    ...(userId && { Authorization: `Bearer ${localStorage.getItem('token')}` }), // 일반 로그인일 경우 토큰 추가
                },
                ...(social_userId && { credentials: 'include' }), // 소셜 로그인일 경우 쿠키 포함
            };

            const response = await fetch(`${API_URL}/api/chat/read/${UserId}`, fetchOptions);

            if (response.ok) {
                const data = await response.json();
                setView(data);
            } else {
                console.error(`데이터 가져오기 실패: ${response.statusText}`);
            }
        } catch (error) {
            console.error("사용자 정보 가져오기 중 오류:", error);
        }
    };

    useEffect(() => {
        getRecList();
    }, []);

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
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hours = date.getHours();
        const minutes = date.getMinutes().toString();
        return `${month}월 ${day}일 ${hours}시 ${minutes}분`;
    }

    const createFixedWeeks = (data) => {
        const weeksData = [
            { start: "1일", end: "7일", data: [] },
            { start: "8일", end: "14일", data: [] },
            { start: "15일", end: "21일", data: [] },
            { start: "22일", end: "말일", data: [] }
        ]

        data.forEach((item) => {
            const date = new Date(item.createDate);
            const day = date.getDate();

            if (day >= 1 && day <= 7) {
                weeksData[0].data.push(item);
            } else if (day >= 15 && day <= 21) {
                weeksData[2].data.push(item);
            } else if (day >= 22) {
                weeksData[3].data.push(item);
            }
        });

        setWeeks(weeksData);
    }

    const currentWeekData = selectedWeek !== null ? weeks[selectedWeek]?.data || [] : [];


    const filteredView = view.filter((item) => {
        if (filter === "style") return item.recStyle; // 스타일만 보기
        if (filter === "activity") return item.recActivity; // 활동만 보기
        return false;
    });

    // const indexOfLastItem = currentPage * itemPerPage;
    // const indexOfFirstItem = indexOfLastItem - itemPerPage;
    // const currentItems = filteredView.slice(indexOfFirstItem, indexOfLastItem);

    // const handlePageChange = (pageNumber) => {
    //     setCurrentPage(pageNumber);
    // }

    // const totalPages = Math.ceil(filteredView.length / itemPerPage);
    // const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);


    return (
        <div className="recview-back">
            <h2 className="rec-title">추천기록</h2>
            <div className="recView-text">
                <p>받은 결과를 볼 수 있습니다.</p>
                <p> 기록은 최대 30일까지 볼 수 있습니다.</p>
            </div>

            <div className="dropdown-container">
                <select
                    onChange={(e) => setSelectedWeek(parseInt(e.target.value, 10))}
                    value={selectedWeek || ""}
                >
                    <option value="" disabled>주차를 선택하세요</option>
                    {weeks.map((week, index) => (
                        <option key={index} value={index}>
                            {`주차: ${week.start} ~ ${week.end}`}
                        </option>
                    ))}
                </select>
            </div>

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
            <ul className="rec_list">
                <div className="rec_background">
                    {currentItems.map((item, index) => (
                        <li key={index}
                            onClick={() => handleDateClick(item)}
                            style={{ cursor: "pointer", color: "black" }}>
                            {formatDate(item.createDate)}의 기록
                        </li>
                    ))}
                </div>
            </ul>

            {/* {totalPages > 1 && (
                <div className="pagination">
                    {pageNumbers.map((number) => (
                        <button
                            key={number}
                            onClick={() => handlePageChange(number)}
                            className={number === currentPage ? "active" : ""}>
                            {number}
                        </button>
                    ))}
                </div>
            )} */}

            {showModal && selecteRec && (
                <div className="modal-background">
                    <div className="modal-content">
                        <div className="modal-header">
                        <h3>{formatDate(selecteRec.createDate)}의 기록</h3>
                        <button className="modal-button" onClick={closeModal}>X</button>
                        </div>
                        <p> 최고: {selecteRec.temp_high}℃ 최저: {selecteRec.temp_low}℃ </p>
                        <p>{selecteRec.recActivity || selecteRec.recStyle}</p>
                        {/* 이미지가 존재하면 이미지 URL로 이미지를 표시 */}
                        {selecteRec.imageUrl && (
                            <div>
                                <img src={selecteRec.imageUrl} alt="추천된 옷차림" style={{ maxWidth: "100%", marginTop: "20px" }} />
                            </div>
                        )}
                        <button onClick={closeModal}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default recView;
