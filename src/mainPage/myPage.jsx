import React from "react";
import { useState, useEffect } from "react";

function myPage(){
    const [userData, setUserData] = useState({
        id: "",
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
            const username = localStorage.getItem('username');
            
            try {
                const response = await fetch(`http://localhost:8080/api/users/show/${username}`, {
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
                console.log("Fetched username:", localStorage.getItem('username'));
            }
        }

        fetchUserData();
    }, []);

    // 사용자 정보 수정 API 요청
    const handleSaveChanges = async () => {
        // e.preventDefault();
        try {
            const response = await fetch("http://localhost:8080/api/users/update?id", {
                method: "PUT",
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                setMessage("회원 정보가 성공적으로 수정되었습니다.");
                setEditMode(false);
            } else {
                setMessage("회원 정보 수정에 실패했습니다.");
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
                    <label>id: </label>
                    <input 
                        type="text" 
                        name="id" 
                        value={userData.id} 
                        onChange={handleChange} 
                    />
                    <br/>

                    <label>Username: </label>
                    <input 
                        type="text" 
                        name="username" 
                        value={userData.username} 
                        onChange={handleChange} 
                    />
                    <br/>

                    <label>Email: </label>
                    <input 
                        type="email" 
                        name="email" 
                        value={userData.email} 
                        onChange={handleChange} 
                    />
                    <br/>

                    {/* <label>Age: </label>
                    <input 
                        type="number" 
                        name="age" 
                        value={userData.age} 
                        onChange={handleChange} 
                    /> */}
                    <br/>

                    {/* <label>Job: </label>
                    <input 
                        type="text" 
                        name="job" 
                        value={userData.job} 
                        onChange={handleChange} 
                    /> */}
                    <br/>

                    <button onClick={handleSaveChanges}>저장</button>
                    <button onClick={() => setEditMode(false)}>취소</button>
                </div>
            ) : (
                <div>
                    <p><strong>Id:</strong> {userData.id}</p>
                    <p><strong>Username:</strong> {userData.username}</p>
                    <p><strong>Email:</strong> {userData.email}</p>
                    {/* <p><strong>Age:</strong> {userData.age}</p> */}
                    {/* <p><strong>Job:</strong> {userData.job}</p> */}
                    <button onClick={() => setEditMode(true)}>수정</button>
                </div>
            )}

            {message && <p>{message}</p>}
        </div>
    );
}

export default myPage;