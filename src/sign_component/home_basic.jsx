import React from "react";
import { useNavigate } from "react-router-dom";
import sign_up from './sign_up.jsx';

function HomeBasic() {
    const navigate = useNavigate();

    // 회원가입 버튼 클릭 시 '/sign_up' 페이지로 이동하는 함수
    const handleSignUpClick = () => {
        navigate('/sign_up');
    };

    return (
        <div>
            <h1> All-in-Weather </h1>
            <div className="div-box">
                <button onClick={handleSignUpClick}>
                    회원가입
                </button>
                <p></p>
                <button>
                    로그인
                </button>
            </div>
        </div>
    );
}

export default HomeBasic;
