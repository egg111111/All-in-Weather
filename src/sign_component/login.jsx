import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import './login.css';
import InputBox from "./InputBox";
import googleImg from '/src/assets/googleSignIn.png';
import naverImg from '/src/assets/naverSignIn.png';
import kakaoImg from '/src/assets/kakaoSignIn.png';
const API_URL = import.meta.env.VITE_API_URL;

function Login() {
    const idRef = useRef(null);
    const passwordRef = useRef(null);
    
    const [userId, setUserId] = useState(''); // string 타입 선언 제거
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');


    const navigate = useNavigate();

    const onSignUpButtonClickHandler = () => {
        navigate('/sign_up');
    };

    const handleLogin = async (e) => {
        if(!userId || !password) {
            alert('아이디와 비밀번호 모두 입력하세요.');
            return;
        }
        e.preventDefault();

        // 기존 토큰 삭제
        // localStorage.removeItem('token');
        // localStorage.removeItem('refreshToken');
        // localStorage.removeItem('tokenExpiry');

        const loginData = { userId, password };

        try {
            const response = await fetch(`${API_URL}/api/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData),
            });

            if (response.ok) {
                const data = await response.json();
                const token = data.token;
                const refreshToken = data.refreshToken;
                const tokenExpiry = data.tokenExpiry;
                console.log('로그인 성공:', data);

                // 로그인 성공 시 토큰, 유저아이디 저장 
                localStorage.setItem('token', token);
                localStorage.setItem('refreshToken', refreshToken);
                localStorage.setItem('userId', userId);
                localStorage.setItem('tokenExpiry', tokenExpiry);

                navigate('/dashboard');
            } else {
                const errorData = await response.json();
                setError(errorData.message || '로그인에 실패했습니다.');
            }
        } catch (error) {
            console.error('로그인 중 에러 발생:', error);
            setError('서버와의 연결이 원활하지 않습니다. 다시 시도해주세요.');
            Swal.fire({
                title: "로그인에 실패했습니다.",
                text: "아이디 또는 비밀번호를 다시 확인해주세요.",
                icon: "error"
            });
        }
    };

    const onIdKeyDownHandler = (event) => {
        if (event.key !== 'Enter') return;
        if (passwordRef.current) passwordRef.current.focus();
    };

    const onPasswordKeyDownHandler = (event) => {
        if (event.key !== 'Enter') return;
        handleLogin(event);
    };

    const handleGoogleLogin = () => {
        window.location.href = `${API_URL}/oauth2/authorization/google`;
    };

    const handleNaverLogin = () => {
        window.location.href = `${API_URL}/oauth2/authorization/naver`;
    };

    const handleKakaoLogin = () => {
        window.location.href = `${API_URL}/oauth2/authorization/kakao`;
    };

    const checkTokenValidity = () => {
        const token = localStorage.getItem('token');
        const tokenExpiry = localStorage.getItem('tokenExpiry');
    
        if (!token || !tokenExpiry) {
            return false;
        }
    
        const currentTime = Date.now();
        return currentTime < parseInt(tokenExpiry, 10); // 현재 시간과 만료 시간 비교
    };

    useEffect(() => {
        const isTokenValid = checkTokenValidity();
        if (isTokenValid) {
            navigate('/dashboard');
        }
    }, [navigate]);

    return (
        <>
            <div className='sign-in-container'>
                <div className='sign-in-box'>
                    <h1 className="title-div">로그인</h1>
                    <div className='sign-in-content-box'>
                        <div className='sign-in-content-input-box'>
                            <InputBox
                                ref={idRef}
                                title='아이디'
                                placeholder='아이디를 입력해주세요'
                                type='text'
                                value={userId}
                                onChange={(e) => { setUserId(e.target.value); setError(''); }}
                                onKeyDown={onIdKeyDownHandler}
                            />
                            <InputBox
                                ref={passwordRef}
                                title='비밀번호'
                                placeholder='비밀번호를 입력해주세요'
                                type='password'
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                onKeyDown={onPasswordKeyDownHandler}
                                isErrorMessage
                                message={error}
                            />
                        </div>
                        <div className='sign-in-content-button-box'>
                            <div className='primary-button-lg full-width' onClick={handleLogin}>로그인</div>
                            <div className='text-link-lg full-width' style={{marginBottom: '14px'} } onClick={onSignUpButtonClickHandler}>회원가입</div>
                        </div>
                        <div className='sign-in-content-divider'></div>
                        <div className='sign-in-content-sns-sign-in-box'></div>
                        <div className='sign-in-content-sns-sign-in-title'>SNS 로그인</div>
                        <div className='sign-in-content-sns-sign-in-button-box'>
                        <div style={{ textAlign: 'center', marginTop: '20px', marginBottom: '10px' }}>
                            <div style={{ margin: '10px' }}>
                                <img src={googleImg} alt="Login with Google" onClick={handleGoogleLogin} style={{ cursor: 'pointer', width: '150px', height: 'auto' }}/>
                            </div>
                            <div style={{ margin: '10px' }}>
                                <img src={naverImg} alt="Login with Naver" onClick={handleNaverLogin} style={{ cursor: 'pointer', width: '150px', height: 'auto' }}/>
                            </div>
                            <div style={{ margin: '10px' }}>
                                <img src={kakaoImg} alt="Login with Kakao" onClick={handleKakaoLogin} style={{ cursor: 'pointer', width: '150px', height: 'auto' }}/>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>
            </div>    
        </>
    );
}

export default Login;
