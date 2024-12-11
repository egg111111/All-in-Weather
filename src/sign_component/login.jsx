import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import './login.css';
import InputBox from "./InputBox";
import googleImg from '/src/assets/googleSignIn.png';
import naverImg from '/src/assets/naverSignIn.png';
import kakaoImg from '/src/assets/kakaoSignIn.png';
import { messaging } from '../firebase';
import { getToken } from "firebase/messaging"; // getToken 가져오기
const API_URL = import.meta.env.VITE_API_URL;

function Login() {
    const idRef = useRef(null);
    const passwordRef = useRef(null);
    
    const [userId, setUserId] = useState(''); // string 타입 선언 제거
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    // 알림 권한 요청 (앱 로드시 요청)
    useEffect(() => {
        // 알림 권한 요청
        if (Notification.permission !== 'granted') {
            Notification.requestPermission()
                .then((permission) => {
                    if (permission === 'granted') {
                        console.log("알림 권한이 허용되었습니다.");
                    } else {
                        console.warn("알림 권한이 거부되었습니다.");
                    }
                });
        }
    
        // 위치 권한 요청
        const requestLocationPermission = () => {
            if (navigator.geolocation) {
                // 권한 상태를 확인
                navigator.permissions.query({ name: "geolocation" }).then((permissionStatus) => {
                    console.log("위치 권한 상태:", permissionStatus.state);
                    
                    if (permissionStatus.state === "granted") {
                        // 이미 허용된 상태
                        navigator.geolocation.getCurrentPosition(
                            (position) => {
                                console.log("위치 권한 허용됨:", position.coords);
                            }
                        );
                    } else if (permissionStatus.state === "prompt") {
                        // 권한 요청 가능
                        navigator.geolocation.getCurrentPosition(
                            (position) => {
                                console.log("위치 권한 허용됨:", position.coords);
                            },
                            (error) => {
                                console.error("위치 권한 거부됨:", error.message);
                                Swal.fire({
                                    title: "위치 권한 필요",
                                    text: "날씨 정보를 제공하려면 위치 권한이 필요합니다.",
                                    icon: "warning",
                                    confirmButtonText: "확인",
                                });
                            }
                        );
                    } else if (permissionStatus.state === "denied") {
                        // 이미 거부된 상태
                        Swal.fire({
                            title: "위치 권한 필요",
                            text: "브라우저 설정에서 위치 권한을 허용해주세요.",
                            icon: "warning",
                            confirmButtonText: "확인",
                        });
                    }
                });
            } else {
                console.error("이 브라우저는 Geolocation API를 지원하지 않습니다.");
            }
        };

    
        requestLocationPermission();
    }, []);

    useEffect(() => {
        if (navigator.serviceWorker) {
            navigator.serviceWorker.getRegistrations().then((registrations) => {
                registrations.forEach((registration) => {
                    registration.unregister().then(() => {
                        console.log("서비스 워커가 login.jsx에서 비활성화되었습니다");
                    });
                });
            });
        }
    }, []);

    useEffect(() => {
        const deleteCookies = () => {
            // 삭제할 쿠키 이름 리스트
            const cookiesToDelete = ["Authorization", "JSESSIONID"];
            cookiesToDelete.forEach((cookieName) => {
                document.cookie = `${cookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
            });
            console.log("쿠키 삭제 완료");
        };
    
        // 페이지 로드 시 불필요한 쿠키 삭제
        deleteCookies();
    }, []);
    

    const onSignUpButtonClickHandler = () => {
        navigate('/sign_up');
    };

    const handleLogin = async (e) => {
        if(!userId || !password) {
            alert('아이디와 비밀번호 모두 입력하세요.');
            return;
        }
        e.preventDefault();

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

                // FCM 토큰 발급 전 권한 확인
                if (Notification.permission === 'granted') {
                    getToken(messaging, { vapidKey: import.meta.env.VITE_FCM_vapidKey })
                        .then((fcmToken) => {
                            if (fcmToken) {
                                console.log("FCM Token:", fcmToken);
                                fetch(`${API_URL}/api/users/update/fcm_token`, {
                                    method: 'PUT',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        userId: userId,
                                        fcmToken: fcmToken,
                                    }),
                                })
                                .then(response => response.json())
                                .then(data => console.log("FCM 토큰 업데이트 성공:", data))
                                .catch(err => console.error("FCM 토큰 업데이트 실패:", err));
                            } else {
                                console.error("FCM 토큰을 발급받을 수 없습니다.");
                            }
                        })
                        .catch((err) => {
                            console.error("FCM 토큰 발급 실패:", err);
                        });
                } else {
                    console.error("알림 권한이 허용되지 않았습니다.");
                }

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
