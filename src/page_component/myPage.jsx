import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import googleImage from '/src/assets/images/google.png';
import naverImage from '/src/assets/images/naver.png';
import kakaoImage from '/src/assets/images/kakao.png';
import generalApiClient from '../service/generalApiClient'; // 일반 로그인용 API 클라이언트
import socialApiClient from '../service/socialApiClient'; // 소셜 로그인용 API 클라이언트

const API_URL = import.meta.env.VITE_API_URL;

function myPage() {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [message, setMessage] = useState("");
    const [isSocialLogin, setIsSocialLogin] = useState(false);

    const [loading, setLoading] = useState(true); // 로딩 상태 추가

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
        return <p>로딩 중...</p>;
    }

    // 소셜 로그인 사용자의 이미지 설정 함수
    const getProviderImage = () => {
        const provider = Object.keys(providerImages).find(key =>
            userInfo.userId?.includes(key)
        );
        return provider ? providerImages[provider] : null;
    };

    return (
        <div>
            <h2>회원 정보</h2>
            {userInfo ? (
                isSocialLogin ? (
                    <div>
                        {editMode ? (
                            <div>
                                <label>닉네임: </label> 
                                <img src={getProviderImage()} alt={userInfo.social_userId} style={{ width: "20px", marginRight: "5px", display: "inline" }} />
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
                            <div>
                                <p>
                                    <strong>닉네임: </strong> 
                                    <img src={getProviderImage()} alt={userInfo.userId} style={{ width: "20px", marginRight: "5px", display: "inline" }} />
                                    <span style={{ display: "inline" }}>{userInfo.nickname}</span>
                                </p>
                                <p><strong>이메일 주소:</strong> {userInfo.email}</p>
                                <p><strong>나이:</strong> {userInfo.age}</p>
                                <p><strong>성별:</strong> {userInfo.gender}</p>
                                <p><strong>키:</strong> {userInfo.height}</p>
                                <p><strong>몸무게:</strong> {userInfo.weight}</p>
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
                                <label>아이디: </label>
                                <input type="text" name="userId" value={userInfo.userId} onChange={handleChange} />
                                <br />
                                <label>닉네임: </label>
                                <input type="text" name="nickname" value={userInfo.nickname} onChange={handleChange} />
                                <br />
                                <label>이메일: </label>
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
                                <br />
                                <button style={{ marginRight: '10px'}} onClick={handleSaveChanges}>저장</button>
                                <button onClick={() => setEditMode(false)}>취소</button>
                            </div>
                        ) : (
                            <div>
                                <p><strong>아이디:</strong> {userInfo.userId}</p>
                                <p><strong>닉네임:</strong> {userInfo.nickname}</p>
                                <p><strong>이메일:</strong> {userInfo.email}</p>
                                <p><strong>나이:</strong> {userInfo.age}</p>
                                <p><strong>성별:</strong> {userInfo.gender}</p>
                                <p><strong>키:</strong> {userInfo.height}</p>
                                <p><strong>몸무게:</strong> {userInfo.weight}</p>
                                <button style={{ marginRight: '10px' }} onClick={() => setEditMode(true)}>회원 정보 수정</button>
                                <button onClick={() => navigate('/pwUpdate')}>비밀번호 변경</button>
                                <button style={{ marginTop: '10px' }} onClick={() => navigate('/dashboard')}>돌아가기</button>
                                <br/>
                                <button style={{ marginTop: '10px' }} onClick={() => { navigate('/delete'); }}>회원 탈퇴</button>
                            </div>
                        )}
                    </div>
                )
            ) : (
                <p>로딩 중...</p>
            )}
            {message && <p>{message}</p>}
        </div>
    );
}

export default myPage;
