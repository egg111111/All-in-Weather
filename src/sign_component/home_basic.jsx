import React from "react";
import { useNavigate } from "react-router-dom";


function homeBasic() {
    const navigate = useNavigate();


    const handleSignUpClick = () => {
        navigate('/sign_up');
    };


    const handleLoginClick = () => {
        navigate('/login');
    };


    return (
        <div>
            <h1> All-in-Weather </h1>
            <div className="div-box">
                <button onClick={handleSignUpClick}>
                    회원가입
                </button>
                <p></p>
                <button onClick={handleLoginClick}>
                    로그인
                </button>
            </div>
        </div>
    );
}


export default homeBasic;
