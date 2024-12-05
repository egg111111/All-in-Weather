import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setTitle } from "../reducers/titleSlice.js";

import Swal from "sweetalert2";
import './myPage.css'
import Loading from '../header_footer/loading.jsx';

import googleImage from '/src/assets/images/google.png';
import naverImage from '/src/assets/images/naver.png';
import kakaoImage from '/src/assets/images/kakao.png';
import generalApiClient from '../service/generalApiClient'; // 일반 로그인용 API 클라이언트
import socialApiClient from '../service/socialApiClient'; // 소셜 로그인용 API 클라이언트
import { color } from "chart.js/helpers";

const API_URL = import.meta.env.VITE_API_URL;

function myPage() {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [message, setMessage] = useState("");
    const [isSocialLogin, setIsSocialLogin] = useState(false);

    const [loading, setLoading] = useState(true); // 로딩 상태 추가
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setTitle('마이페이지'));
    }, [dispatch]);

    // 사용자 정보 가져오기
    useEffect(() => {
        const userId = localStorage.getItem('userId');
        const social_userId = localStorage.getItem('social_userId');

        // 소셜 로그인인 경우 userId를 localStorage에 저장
        if (social_userId) {
            setIsSocialLogin(true);
            fetchUserInfo(social_userId, true);
        } else if (userId) {
            setIsSocialLogin(false);
            fetchUserInfo(userId, false);
        } else {
            setMessage("로그인 정보가 없습니다.");
            setLoading(false);
        }
    }, []);

    const fetchUserInfo = async (userId, isSocial) => {
        const apiClient = isSocial ? socialApiClient : generalApiClient;

        try {
            const response = await apiClient.get(`/api/users/show/${userId}`);
            setUserInfo(response.data);
            console.log("User Info:", response.data);  // 콘솔에 출력
            setLoading(false);
        } catch (error) {
            console.error("Error fetching user data:", error);
            setMessage("Failed to fetch user information");
        }
    };

    // 사용자 정보 수정 API 요청
    const handleSaveChanges = async () => {
        const apiClient = isSocialLogin ? socialApiClient : generalApiClient;

        try {
            const response = await apiClient.put(
                `/api/users/update/${userInfo.userId}`,
                userInfo // 수정된 사용자 정보
            );

            if (response.status === 200) {
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
                localStorage.setItem('email', userInfo.email);
                localStorage.setItem('age', userInfo.age);
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
        const provider = Object.keys(providerImages).find(key =>
            userInfo.userId?.includes(key)
        );
        return provider ? providerImages[provider] : null;
    };


    return (
        <div className="myPage-all-container">
            <h2 className="myPage-title">회원정보</h2>
            {userInfo ? ( // userInfo가 null이 아닐 때 렌더링
                isSocialLogin ? (
                    <div className="myPage-container">
                        {editMode ? (
                            <div>
                                <label className="myPage-container-title">닉네임</label> <br/>
                                <img src={getProviderImage()} alt={userInfo.social_userId} style={{ width: "20px", marginRight: "5px", height: "20px", display: "inline" }} />
                                <input className="myPage-container-content" type="text" name="nickname" value={userInfo.nickname} onChange={handleChange} />
                                <br />
                                <label className="myPage-container-title">이메일 주소</label> <br/>
                                <input className="myPage-container-content" type="email" name="email" value={userInfo.email} onChange={handleChange} />
                                <br />
                                <label className="myPage-container-title">나이</label> <br/>
                                <input className="myPage-container-content" type="number" name="age" value={userInfo.age} onChange={handleChange} />
                                <br />
                                <label className="myPage-container-title">성별</label> <br/>
                                <input className="myPage-container-content" type="text" name="gender" value={userInfo.gender} onChange={handleChange} />
                                <br />
                                <label className="myPage-container-title">키</label> <br/>
                                <input className="myPage-container-content" type="number" name="height" value={userInfo.height} onChange={handleChange} />
                                <br />
                                <label className="myPage-container-title">몸무게</label> <br/>
                                <input className="myPage-container-content" type="number" name="weight" value={userInfo.weight} onChange={handleChange} />
                                <br />
                                <br/>
                                <div className="myPage-container-button">
                                <button onClick={handleSaveChanges}>확인</button>
                                <button onClick={() => setEditMode(false)}>취소</button>
                                </div>
                            </div>
                        ) : (
                            <div >
                                <p>
                                    <strong className="myPage-container-title">닉네임 </strong>
                                    <br />
                                    <div className="myPage-container-content_social">
                                        <img src={getProviderImage()} alt={userInfo.userId} style={{ width: "20px", marginRight: "5px", objectFit: "contain"}} />
                                        {userInfo.nickname}
                                    </div>
                                </p>
                                <strong className="myPage-container-title">이메일 주소</strong> <br/><div className="myPage-container-content_social">{userInfo.email}</div> <br/>
                                <strong className="myPage-container-title">나이</strong> <br/> <div className="myPage-container-content_social">{userInfo.age}</div><br/>
                                <strong className="myPage-container-title">성별</strong> <br/> <div className="myPage-container-content_social">{userInfo.gender}</div><br/>
                                <strong className="myPage-container-title">키</strong> <br/> <div className="myPage-container-content_social">{userInfo.height}</div><br/>
                                <strong className="myPage-container-title">몸무게</strong> <br/> <div className="myPage-container-content_social">{userInfo.weight}</div><br/>
                                <br/>
                                <hr/>
                                <button style={{ marginLeft:'10%', marginRight: '10px' }} onClick={() => setEditMode(true)}>정보 수정</button>
                                <button  style={{ marginTop: '5px' }} onClick={() => { navigate(-1); }}>취소</button>
                                <p style={{color: '#898989'}} onClick={() => { navigate('/social_delete'); }}>회원 탈퇴</p>
                                {/* <button onClick={() => navigate('/dashboard')}>확인</button> */}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="myPage-container">
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
                                <br/>
                                <div className="myPage-container-button">
                                    <button onClick={handleSaveChanges}>저장</button>
                                    <button onClick={() => setEditMode(false)}>취소</button>
                                </div>
                            </div>
                        ) : (
                            <div >
                                <strong className="myPage-container-title">아이디</strong> <br/> <div className="myPage-container-content" >{userInfo.userId} <br/> </div>
                                <strong className="myPage-container-title">닉네임</strong><br/> <div className="myPage-container-content" >{userInfo.nickname}<br/></div>
                                <strong className="myPage-container-title">이메일</strong><br/> <div className="myPage-container-content" >{userInfo.email}<br/></div>
                                <strong className="myPage-container-title">나이</strong><br/> <div className="myPage-container-content" >{userInfo.age}<br/></div>
                                <strong className="myPage-container-title">성별</strong><br/> <div className="myPage-container-content" >{userInfo.gender}<br/></div>
                                <strong className="myPage-container-title">키</strong><br/> <div className="myPage-container-content" >{userInfo.height}<br/></div>
                                <strong className="myPage-container-title">몸무게</strong><br/> <div className="myPage-container-content" >{userInfo.weight}<br/></div>
                                <br/>
                                <hr/>
                                <button style={{ marginLeft:'10%', marginRight: '10px' }} onClick={() => setEditMode(true)}>정보 수정</button>
                                <button  style={{ marginTop: '5px' }} onClick={() => { navigate(-1); }}>취소</button>
                                <p style={{color: '#898989'}} onClick={() => { navigate('/delete'); }}>회원 탈퇴</p>
                                <br />
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
