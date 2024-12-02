import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './hom_basic.css';

function homeBasic() {
    const navigate = useNavigate();
    const [isTokenValid, setIsTokenValid] = useState(false);

    const checkTokenValidity = () => {
        const token = localStorage.getItem("token");
        const tokenExpiry = localStorage.getItem("tokenExpiry");

        if (!token || !tokenExpiry) {
            console.log("토큰 또는 만료 시간이 없습니다.");
            return false;
        }

        const currentTime = Date.now();
        const expiryTime = parseInt(tokenExpiry, 10);

        if (isNaN(expiryTime)) {
            console.log("토큰 만료 시간이 잘못되었습니다.");
            return false;
        }

        const isValid = currentTime < expiryTime;
        console.log(`현재 시간: ${currentTime}, 만료 시간: ${expiryTime}, 유효성: ${isValid}`);
        return isValid;
    };

    useEffect(() => {
        const valid = checkTokenValidity();
        setIsTokenValid(valid);
        console.log("useEffect 호출됨. Token Valid:", valid);
    }, []);

    const handleSignUpClick = () => {
        navigate('/sign_up');
    };

    const handleLoginClick = () => {
        const valid = checkTokenValidity(); // 항상 최신 값 확인
        console.log("버튼 클릭 시 토큰 유효성:", valid);

        if (valid) {
            console.log("Navigating to /dashboard");
            navigate('/dashboard');
        } else {
            console.log("Navigating to /login");
            navigate('/login');
        }
    };

    return (
        <div className="main-div">
            <h1 className="title-h1"> All-in-Weather </h1>
            <div className="div-box">
                <button onClick={handleSignUpClick}>
                    회원가입
                </button>
                <br />
                <button onClick={handleLoginClick}>
                    로그인
                </button>
            </div>
        </div>
    );
}

export default homeBasic;
