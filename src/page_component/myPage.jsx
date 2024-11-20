import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import './myPage.css'
import Loading from '../header_footer/loading.jsx';

import googleImage from '/src/assets/images/google.png';
import naverImage from '/src/assets/images/naver.png';
import kakaoImage from '/src/assets/images/kakao.png';

const API_URL = import.meta.env.VITE_API_URL;


function myPage() {
    const navigate = useNavigate();
    const [homeUserData, setHomeUserData] = useState({
        userId: "",
        nickname: "",
        email: "",
        age: "",
        gender: "",
        height: "",
        weight: "",
    });
    const [socialUserData, setSocialUserData] = useState({
        social_userId: "",
        name: "",
        email: "",
        social_nickname: "", // 랜덤 닉네임 추가
    });
    const [userInfo, setUserInfo] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [message, setMessage] = useState("");
    const [isSocialLogin, setIsSocialLogin] = useState(false);

    const [loading, setLoading] = useState(true); // 로딩 상태 추가

    // 사용자 정보 가져오기
    useEffect(() => {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        const social_userId = localStorage.getItem('social_userId');

        // 소셜 로그인인 경우 userId를 localStorage에 저장
        if (social_userId) {
            setIsSocialLogin(true);
            fetchUserInfo(social_userId);
        } else if (userId) {
            setIsSocialLogin(false);
            fetchUserInfo(userId, token);
        } else {
            setMessage("로그인 정보가 없습니다.");
            setLoading(false);
        }
    }, []);

    const fetchUserInfo = (userId, token = null) => {
        const fetchOptions = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            ...(userId && { credentials: 'include' }),  // 소셜 로그인인 경우 쿠키 포함
        };

        fetch(`${API_URL}/api/users/show/${userId}`, fetchOptions)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to fetch user data");
                }
                return response.json();
            })
            .then(data => {
                setUserInfo(data);
                console.log("User Info:", data);  // 콘솔에 출력
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching user data:", error);
                setError("Failed to fetch user information");
            });
    };

    // 사용자 정보 수정 API 요청
    const handleSaveChanges = async () => {
        try {
            const social_userId = localStorage.getItem('social_userId');
            const token = localStorage.getItem('token');

            const fetchOptions = {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && !social_userId ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(userInfo), // 수정된 사용자 정보
                ...(social_userId && { credentials: 'include' }), // 소셜 로그인인 경우 쿠키 사용
            };

            const response = await fetch(
                `${API_URL}/api/users/update/${userInfo.userId}`,
                fetchOptions
            );

            if (response.ok) {
                setEditMode(false);
                Swal.fire({
                    title: "회원 정보가 수정되었습니다.",
                    icon: "success",
                    showConfirmButton: false,
                    timer: 1500,
                });

                // 로컬 스토리지 업데이트
                localStorage.setItem('userId', userInfo.userId);
                localStorage.setItem('nickname', userInfo.nickname);
                localStorage.setItem('email', userInfo.email); // 이메일 업데이트
                localStorage.setItem('age', userInfo.age); // 나이 업데이트
                localStorage.setItem('gender', userInfo.gender);
                localStorage.setItem('height', userInfo.height);
                localStorage.setItem('weight', userInfo.weight);
            } else {
                setMessage("회원 정보 수정에 실패했습니다.");
                Swal.fire({
                    title: "회원 정보 수정에 실패했습니다.",
                    icon: "error",
                });
            }
        } catch (error) {
            console.error("회원 정보 수정 중 에러 발생:", error);
            setMessage("회원 정보 수정 중 오류가 발생했습니다.");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserInfo((prev) => ({
            ...prev,
            [name]: value, // 동적으로 필드 업데이트
        }));
    };

    const providerImages = {
        google: googleImage,
        naver: naverImage,
        kakao: kakaoImage
    };

    if (loading) {
        return <Loading />;
    }

    // 소셜 로그인 사용자의 이미지 설정 함수
    const getProviderImage = () => {
        // userId 에서 제공자 키워드 찾기
        const provider = Object.keys(providerImages).find(key =>
            userInfo.userId?.includes(key)
        );
        // 제공자에 해당하는 이미지 반환, 기본 이미지는 defaultImage 사용
        return provider ? providerImages[provider] : defaultImage;
    };


    return (
        <div className="myPage-all-container">
            <h2 className="myPage-title">회원정보</h2>
            {userInfo ? ( // userInfo가 null이 아닐 때 렌더링
                isSocialLogin ? (
                    <div className="myPage-container">
                        {editMode ? (
                            <div>
                                <label>닉네임: </label>
                                <img src={getProviderImage()} alt={userInfo.social_userId} style={{ width: "20px", marginRight: "5px", display: "inline" }} />
                                <br />
                                <input type="text" name="nickname" value={userInfo.nickname} onChange={handleChange} />
                                <br />
                                <label>이메일 주소:</label>
                                <input type="email" name="email" value={userInfo.email} onChange={handleChange} />
                                <br />
                                <label>나이: </label>
                                <input type="number" name="age" value={userInfo.age} onChange={handleChange} />
                                <br />
                                <label>성별: </label>
                                <input type="text" name="gender" value={userInfo.gender} onChange={handleChange} />
                                <br />
                                <label>키: </label>
                                <input type="number" name="height" value={userInfo.height} onChange={handleChange} />
                                <br />
                                <label>몸무게: </label>
                                <input type="number" name="weight" value={userInfo.weight} onChange={handleChange} />
                                <br />
                                <button onClick={handleSaveChanges}>확인</button>
                                <button onClick={() => setEditMode(false)}>취소</button>
                            </div>
                        ) : (
                            <div >
                                <p>
                                    <strong className="myPage-container-title">닉네임 </strong>
                                    <br />
                                    <img src={getProviderImage()} alt={userInfo.userId} style={{ width: "20px", marginRight: "5px", display: "inline" }} />
                                    <span className="myPage-container-content" style={{ display: "inline" }}>{userInfo.nickname}</span>
                                </p>
                                <strong className="myPage-container-title">이메일 주소</strong> <br/><span className="myPage-container-content">{userInfo.email}</span> <br/>
                                <strong className="myPage-container-title">나이</strong> <br/> <span className="myPage-container-content">{userInfo.age}</span><br/>
                                <strong className="myPage-container-title">성별</strong> <br/> <span className="myPage-container-content">{userInfo.gender}</span><br/>
                                <strong className="myPage-container-title">키</strong> <br/> <span className="myPage-container-content">{userInfo.height}</span><br/>
                                <strong className="myPage-container-title">몸무게</strong> <br/> <span className="myPage-container-content">{userInfo.weight}</span><br/>
                                <br/>
                                <button style={{ marginRight: '10px' }} onClick={() => setEditMode(true)}>정보 수정</button>
                                <button style={{ marginTop: '10px' }} onClick={() => { navigate('/social_delete'); }}>회원 탈퇴</button>
                                <br />
                                {/* <button onClick={() => navigate('/dashboard')}>확인</button> */}
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        {editMode ? (
                            <div>
                                <label className="myPage-container-title">아이디 </label>
                                <br/>
                                <input className="myPage-container-content" type="text" name="userId" value={userInfo.userId} onChange={handleChange} />
                                <br />
                                <label className="myPage-container-title">닉네임</label>
                                <br/>
                                <input className="myPage-container-content" type="text" name="nickname" value={userInfo.nickname} onChange={handleChange} />
                                <br />
                                <label  className="myPage-container-title">이메일</label>
                                <br/>
                                <input className="myPage-container-content" type="email" name="email" value={userInfo.email} onChange={handleChange} />
                                <br />
                                <label className="myPage-container-title">나이 </label>
                                <br/>
                                <input className="myPage-container-content" type="number" name="age" value={userInfo.age} onChange={handleChange} />
                                <br />
                                <label className="myPage-container-title">성별</label>
                                <br/>
                                <input className="myPage-container-content" type="text" name="gender" value={userInfo.gender} onChange={handleChange} />
                                <br />
                                <label className="myPage-container-title">키</label>
                                <br/>
                                <input className="myPage-container-content" type="number" name="height" value={userInfo.height} onChange={handleChange} />
                                <br />
                                <label className="myPage-container-title">몸무게</label>
                                <br/>
                                <input className="myPage-container-content" type="number" name="weight" value={userInfo.weight} onChange={handleChange} />
                                <br />
                                <button onClick={handleSaveChanges}>저장</button>
                                <button onClick={() => setEditMode(false)}>취소</button>
                            </div>
                        ) : (
                            <div>
                                <p><strong>아이디:</strong> {userInfo.userId} <br/> </p>
                                <p><strong>닉네임:</strong> {userInfo.nickname}<br/></p>
                                <p><strong>이메일:</strong> {userInfo.email}<br/></p>
                                <p><strong>나이:</strong> {userInfo.age}<br/></p>
                                <p><strong>성별:</strong> {userInfo.gender}<br/></p>
                                <p><strong>키:</strong> {userInfo.height}<br/></p>
                                <p><strong>몸무게:</strong> {userInfo.weight}<br/></p>
                                <button onClick={() => setEditMode(true)}>정보 수정</button>
                                <button onClick={() => navigate('/pwUpdate')}>비밀번호 변경</button>

                                <br />
                                <button onClick={() => { navigate('/delete'); }}>회원 탈퇴</button>
                            </div>
                        )}
                    </div>
                )
            ) : (
                <Loading />
            )}
            {message && <p>{message}</p>}
        </div>
    );
}

export default myPage;


