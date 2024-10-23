import React, { useCallback } from "react";
import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function myPage() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        userId: "",
        username: "",
        email: "",
        age: "",
        // job: ""
    });
    const [editMode, setEditMode] = useState(false);
    const [message, setMessage] = useState("");



    //사용자 정보 가져오기 
    useEffect(() => {

        async function fetchUserData() {
            const userId = localStorage.getItem('userId');

            try {
                const response = await fetch(`http://localhost:8080/api/users/show/${userId}`, {
                    method: "GET",
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                setUserData(data);
            } catch (error) {
                console.error("사용자 정보 가져오기 실패:", error);
                console.log("Fetched token:", localStorage.getItem('token'));
                console.log("Fetched username:", localStorage.getItem('userId'));
            }
        }

        fetchUserData();
    }, []);

    // 사용자 정보 수정 API 요청
    const handleSaveChanges = async () => {
        const userId = localStorage.getItem('userId');
        // e.preventDefault();
        try {
            const response = await fetch(`http://localhost:8080/api/users/update/${userId}`, {
                method: "PUT",
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                setEditMode(false);
                Swal.fire({
                    title: "회원 정보가 수정되었습니다.",
                    icon: "success",
                    showConfirmButton: false,
                    timer: 1500
                });

                localStorage.setItem('userId', userData.userId);
                localStorage.setItem('username', userData.username);
            } else {
                setMessage("회원 정보 수정에 실패했습니다.");
                Swal.fire({
                    title: "회원 정보 수정에 실패했습니다..",
                    icon: "error"
                })
            }
        } catch (error) {
            console.error("회원 정보 수정 중 에러 발생:", error);
            setMessage("회원 정보 수정 중 오류가 발생했습니다.");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData({ ...userData, [name]: value });
    };


    return (
        <div>
            <h2>회원 정보</h2>
            {editMode ? (
                <div>


                    <label>userId: </label>
                    <input
                        type="text"
                        name="userId"
                        value={userData.userId}
                        onChange={handleChange}
                    />
                    <br />

                    <label>Usernmae: </label>
                    <input
                        type="text"
                        name="username"
                        value={userData.username}
                        onChange={handleChange}
                    />
                    <br />

                    <label>Email: </label>
                    <input
                        type="email"
                        name="email"
                        value={userData.email}
                        onChange={handleChange}
                    />
                    <br />

                    <label>Age: </label>
                    <input
                        type="number"
                        name="age"
                        value={userData.age}
                        onChange={handleChange}
                    />
                    <br />

                    {/* <label>Job: </label>
                    <input 
                        type="text" 
                        name="job" 
                        value={userData.job} 
                        onChange={handleChange} 
                    /> */}
                    <br />

                    <button onClick={handleSaveChanges}>저장</button>
                    <button onClick={() => setEditMode(false)}>취소</button>
                </div>
            ) : (
                <div>
                    <p><strong>ID:</strong> {userData.id}</p>
                    <p><strong>UserId:</strong> {userData.userId}</p>
                    <p><strong>Username:</strong> {userData.username}</p>
                    <p><strong>Email:</strong> {userData.email}</p>
                    <p><strong>Age:</strong> {userData.age}</p>
                    {/* <p><strong>Job:</strong> {userData.job}</p> */}
                    <button onClick={() => setEditMode(true)}>회원 정보 수정</button>
                    <button onClick={() => { navigate('/pwUpdate'); }}>비밀번호 변경</button>
                    <button onClick={() => { navigate('/dashboard'); }}>돌아가기</button>
                </div>
            )}

            {message && <p>{message}</p>}
        </div>
    );
}

export default myPage;