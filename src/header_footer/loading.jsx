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
    display: "flex",
    flexDirection: 'column',
    width: "100%",
    justifyContent: 'center',
    color: "#fff",
};

const override = {
    margin: 'auto'
}

function Loading() {
    const [timeLimit, setTimeLimit] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLimit(true); 
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
                timer: 3000,
            }).then(() => {
                setTimeLimit(false);
                navigate('/dashboard');
            });
        }
    }, [timeLimit]);

    return (
        !timeLimit && ( // timeLimit이 false일 때만 로딩 화면 표시
            <div style={modalStyle}>
                <div style={loaderStyle}>
                    <HashLoader color="#fff" loading={true} cssOverride={override} />
                    <p>잠시만 기다려주세요</p>
                </div>
            </div>
        )
    );
}

export default Loading;
