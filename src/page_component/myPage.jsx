import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import googleImage from '/src/assets/images/google.png';
import naverImage from '/src/assets/images/naver.png';
import kakaoImage from '/src/assets/images/kakao.png';
const API_URL = import.meta.env.VITE_API_URL;

function myPage() {
    const navigate = useNavigate();
    const [homeUserData, setHomeUserData] = useState({
        userId: "",
        username: "",
        email: "",
        age: "",
    });
    const [socialUserData, setSocialUserData] = useState({
        social_userId: "",
        name: "",
        email: "",
        social_nickname: "", // 랜덤 닉네임 추가
    });
    const [editMode, setEditMode] = useState(false);
    const [message, setMessage] = useState("");
    const [isSocialLogin, setIsSocialLogin] = useState(false);

    // 사용자 정보 가져오기
    useEffect(() => {
        async function fetchUserData() {
            const userId = localStorage.getItem('userId');
            console.log("Retrieved userId:", userId);
            try {
                let response;

                // 일반 로그인일 경우
                if (userId) {
                    response = await fetch(`${API_URL}/api/users/show/${userId}`, {
                        method: "GET",
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setHomeUserData(data);
                        setIsSocialLogin(false);
                    }
                } 
                // 소셜 로그인일 경우
                else {
                    response = await fetch(`${API_URL}/api/users/social_user`, {
                        method: "GET",
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        credentials: 'include', // JWT 쿠키를 전송
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setSocialUserData(data);
                        localStorage.setItem('social_nickname', data.social_nickname);
                        localStorage.setItem('social_userId', data.social_userId);
                        localStorage.setItem('name', data.name);
                        localStorage.setItem('email', data.email);
                    }
                }
            } catch (error) {
                console.error("사용자 정보 가져오기 중 오류:", error);
            }
        }fetchUserData();
    }, []);

    // 사용자 정보 수정 API 요청
    const handleSaveChanges = async () => {
        try {
            let response;
            if (isSocialLogin) {
                // 소셜 로그인 데이터 전송
                response = await fetch(`${API_URL}/api/users/update/social/${socialUserData.social_userId}`, {
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
                    console.log("Updated nickname:", socialUserData.social_nickname); 
                    localStorage.setItem('social_nickname', socialUserData.social_nickname); // 닉네임 업데이트
                    localStorage.setItem('name', socialUserData.name); // 이름 업데이트
                    localStorage.setItem('email', socialUserData.email); // 이메일 업데이트
                }
            } else {
                // 일반 로그인 데이터 전송
                response = await fetch(`${API_URL}/api/users/update/${homeUserData.userId}`, {
                    method: "PUT",
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(homeUserData) // 일반 로그인 데이터
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
                    localStorage.setItem('userId', homeUserData.userId);
                    localStorage.setItem('username', homeUserData.username);
                    localStorage.setItem('email', homeUserData.email); // 이메일 업데이트
                    localStorage.setItem('age', homeUserData.age); // 나이 업데이트
                }
            }
    
            if (!response.ok) {
                setMessage("회원 정보 수정에 실패했습니다.");
                Swal.fire({
                    title: "회원 정보 수정에 실패했습니다.",
                    icon: "error"
                });
            }
        } catch (error) {
            console.error("회원 정보 수정 중 에러 발생:", error);
            setMessage("회원 정보 수정 중 오류가 발생했습니다.");
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
            // 일반 로그인 데이터 변경
            setHomeUserData((prevData) => ({
                ...prevData,
                [name]: value,
            }));
        }
    };
    
    const providerImages = {
        google: googleImage,
        naver: naverImage,
        kakao: kakaoImage
    };
    
    // 소셜 로그인 사용자의 이미지 설정 함수
    const getProviderImage = () => {
        // social_username에서 제공자 키워드 찾기
        const provider = Object.keys(providerImages).find(key =>
            socialUserData.social_userId?.includes(key)
        );
        // 제공자에 해당하는 이미지 반환, 기본 이미지는 defaultImage 사용
        return provider ? providerImages[provider] : defaultImage;
    };
    

    return (
        <div>
            <h2>회원 정보</h2>
            {isSocialLogin ? (
                <div>
                    {editMode ? (
                        <div>
                            <label>닉네임: </label> 
                            <img src={getProviderImage()} alt={socialUserData.social_userId} style={{ width: "20px", marginRight: "5px", display: "inline" }} />
                            <input type="text" name="nickname" value={socialUserData.social_nickname} onChange={handleChange} />
=======
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
                            <p>
                                <strong>닉네임: </strong> 
                                <img src={getProviderImage()} alt={socialUserData.social_userId} style={{ width: "20px", marginRight: "5px", display: "inline" }} />
                                <span style={{ display: "inline" }}>{socialUserData.social_nickname}</span>
                            </p>
                            <p><strong>이름:</strong> {socialUserData.name}</p>
                            {/* <p><strong>소셜 ID:</strong> {socialUserData.social_username}</p> */}
                            <p><strong>이메일 주소:</strong> {socialUserData.email}</p>
                            <button style={{ marginRight: '10px' }} onClick={() => setEditMode(true)}>회원 정보 수정</button>
                            <button onClick={() => navigate('/dashboard')}>확인</button>
                            <br/>
                            <button style={{ marginTop: '10px' }} onClick={() => { navigate('/social_delete'); }}>회원 탈퇴</button>
 </div>
                    )}
                </div>
            ) : (
                <div>
                    {editMode ? (
                        <div>
                            <label>UserId: </label>
                            <input type="text" name="userId" value={homeUserData.userId} onChange={handleChange} />
                            <br />
                            <label>Username: </label>
                            <input type="text" name="username" value={homeUserData.username} onChange={handleChange} />
                            <br />
                            <label>Email: </label>
                            <input type="email" name="email" value={homeUserData.email} onChange={handleChange} />
                            <br />
                            <label>Age: </label>
                            <input type="number" name="age" value={homeUserData.age} onChange={handleChange} />
                            <br />
                            <button onClick={handleSaveChanges}>저장</button>
                            <button onClick={() => setEditMode(false)}>취소</button>
                        </div>
                    ) : (
                        <div>
                            <p><strong>UserId:</strong> {homeUserData.userId}</p>
                            <p><strong>Username:</strong> {homeUserData.username}</p>
                            <p><strong>Email:</strong> {homeUserData.email}</p>
                            <p><strong>Age:</strong> {homeUserData.age}</p>
                            <button onClick={() => setEditMode(true)}>회원 정보 수정</button>
                            <button onClick={() => navigate('/pwUpdate')}>비밀번호 변경</button>
                            <button onClick={() => navigate('/dashboard')}>돌아가기</button>
                            <br/>
                            <button onClick={() => { navigate('/delete'); }}>회원 탈퇴</button>
                         </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default myPage;