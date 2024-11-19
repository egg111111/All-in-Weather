import React from "react";
import { useNavigate } from "react-router-dom";
import './hom_basic.css';


function homeBasic() {
    const navigate = useNavigate();


    const handleSignUpClick = () => {
        navigate('/sign_up');
    };


    const handleLoginClick = () => {
        navigate('/login');
    };


    return (
        <div className="main-div">
            <h1 className="title-h1"> All-in-Weather </h1>
            <div className="div-box">
                <button onClick={handleSignUpClick}>
                    회원가입
                </button>
                <br/>
                <button onClick={handleLoginClick}>
                    로그인
                </button>
            </div>
        </div>
    );
}


export default homeBasic;
