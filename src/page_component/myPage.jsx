import React, { useCallback } from "react";
import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import googleImage from '/src/assets/images/google.png';
import naverImage from '/src/assets/images/naver.png';

function myPage() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        userId: "",
        username: "",
        email: "",
        age: "",
        // job: ""
    });
    const [socialUserData, setSocialUserData] = useState({
        social_username: "",
        name: "",
        email: "",
        nickname: "", // 랜덤 닉네임 추가
    });

    const [editMode, setEditMode] = useState(false);
    const [message, setMessage] = useState("");
    const [isSocialLogin, setIsSocialLogin] = useState(false);




    //사용자 정보 가져오기 
    useEffect(() => {

        async function fetchUserData() {
            const userId = localStorage.getItem('userId');

            console.log("Retrieved userId:", userId);
            try {
                // 일반 로그인일 경우
                if (userId) {
                    const response = await fetch(`http://localhost:8080/api/users/show/${userId}`, {
                        method: "GET",
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setUserData(data);
                        setIsSocialLogin(false);
                    }
                }
                // 소셜 로그인일 경우
                else {
                    const response = await fetch('http://localhost:8080/api/users/social_user', {
                        method: "GET",
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        credentials: 'include', // JWT 쿠키를 전송
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setSocialUserData(data);
                        setIsSocialLogin(true);
                    }
                }
            } catch (error) {
                console.error("사용자 정보 가져오기 중 오류:", error);
            }
        }
        fetchUserData();

    }, []);

    // 사용자 정보 수정 API 요청
    const handleSaveChanges = async () => {
        const userId = localStorage.getItem('userId');
        if (isSocialLogin) { //소셜로그인의 경우
            const response = await fetch(`http://localhost:8080/api/users/update/social/${socialUserData.social_username}`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // 쿠키를 포함하여 전송
                body: JSON.stringify(socialUserData) // 소셜 로그인 데이터
            });

            if (response.ok) {
                setEditMode(false);
                Swal.fire({
                    title: "회원 정보가 수정되었습니다.",
                    icon: "success",
                    showConfirmButton: false,
                    timer: 1500
                });

                // 로컬 스토리지 업데이트
                localStorage.setItem('nickname', socialUserData.nickname); // 닉네임 업데이트
                localStorage.setItem('name', socialUserData.name); // 이름 업데이트
                localStorage.setItem('email', socialUserData.email); // 이메일 업데이트
            }
        }
        else { //일반 로그인의 경우
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
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (isSocialLogin) {
            // 소셜 로그인 데이터 변경
            setSocialUserData((prevData) => ({
                ...prevData,
                [name]: value,
            }));
        } else {
            setUserData({ ...userData, [name]: value });
        }
    };

    const getProviderImage = () => {
        const provider = socialUserData.social_username?.split('_')[0];
        return provider === 'google' ? googleImage : naverImage;
    };



    return (
        <div>
            <h2>회원 정보</h2>
            {isSocialLogin ? (
                <div>
                    {editMode ? (
                        <div>
                            <label>닉네임: </label>
                            <img src={getProviderImage()} alt={socialUserData.social_username} style={{ width: "20px", marginRight: "5px", display: "inline" }} />
                            <input type="text" name="nickname" value={socialUserData.nickname} onChange={handleChange} />
                            <br />
                            <label>이름:</label>
                            <input type="text" name="name" value={socialUserData.name} onChange={handleChange} />
                            <br />
                            <label>이메일 주소:</label>
                            <input type="email" name="email" value={socialUserData.email} onChange={handleChange} />
                            <br />
                            <button onClick={handleSaveChanges}>확인</button>
                            <button onClick={() => setEditMode(false)}>취소</button>
                        </div>
                    ) : (
                        <div>
                            <p><strong>닉네임: </strong><img src={getProviderImage()} alt={socialUserData.social_username} style={{ width: "20px", marginRight: "5px", display: "inline" }} /><span style={{ display: "inline" }}>{socialUserData.nickname}</span></p>
                            <p><strong>이름:</strong> {socialUserData.name}</p>
                            <p><strong>이메일 주소:</strong> {socialUserData.email}</p>
                            <button onClick={() => setEditMode(true)}>회원 정보 수정</button>
                            <button onClick={() => navigate('/dashboard')}>돌아가기</button>
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    {editMode ? (
                        <div>
                            <label>UserId: </label>
                            <input type="text" name="userId" value={userData.userId} onChange={handleChange} />
                            <br />
                            <label>Username: </label>
                            <input type="text" name="username" value={userData.username} onChange={handleChange} />
                            <br />
                            <label>Email: </label>
                            <input type="email" name="email" value={userData.email} onChange={handleChange} />
                            <br />
                            <label>Age: </label>
                            <input type="number" name="age" value={userData.age} onChange={handleChange} />
                            <br />
                            <button onClick={handleSaveChanges}>저장</button>
                            <button onClick={() => setEditMode(false)}>취소</button>
                        </div>
                    ) : (
                        <div>
                            <p><strong>UserId:</strong> {userData.userId}</p>
                            <p><strong>Username:</strong> {userData.username}</p>
                            <p><strong>Email:</strong> {userData.email}</p>
                            <p><strong>Age:</strong> {userData.age}</p>
                            <button onClick={() => setEditMode(true)}>회원 정보 수정</button>
                            <button onClick={() => navigate('/pwUpdate')}>비밀번호 변경</button>
                            <button onClick={() => navigate('/dashboard')}>돌아가기</button>
                            <button onClick={() => navigate('/delete')}>회원 탈퇴</button>
                        </div>
                    )}
                </div>
            )}
            {message && <p>{message}</p>}
        </div>
    );
}

export default myPage;