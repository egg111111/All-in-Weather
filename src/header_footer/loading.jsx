import React, { useEffect, useState } from "react";
import { HashLoader } from "react-spinners";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const modalStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "120vh",
    backgroundColor: "rgb(30 41 65 / 60%)",
    display: "grid",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
};

const loaderStyle = {
    textAlign: "center",
    color: "#fff",
};

function Loading() {
    const [timeLimit, setTimeLimit] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLimit(true); // 10초 후 timeLimit 상태를 true로 변경
        }, 20000);

        return () => clearTimeout(timer); // 컴포넌트 언마운트 시 타이머 정리
    }, []);

    useEffect(() => {
        if (timeLimit) {
            Swal.fire({
                title: "시간 초과",
                text: "잠시 후 다시 시도해주세요.",
                icon: "warning",
                showConfirmButton: false,
                timer: 1500, // Swal 창이 1.5초 후 자동으로 닫힘
            }).then(() => {
                // Swal 닫힌 후 로딩 화면 닫기
                setTimeLimit(false);
                navigate('/dashboard');
            });
        }
    }, [timeLimit]);

    return (
        !timeLimit && ( // timeLimit이 false일 때만 로딩 화면 표시
            <div style={modalStyle}>
                <div style={loaderStyle}>
                    <HashLoader color="#fff" loading={true} size={70} />
                    <p>잠시만 기다려주세요</p>
                </div>
            </div>
        )
    );
}

export default Loading;
