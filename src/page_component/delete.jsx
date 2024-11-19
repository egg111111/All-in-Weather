import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
const API_URL = import.meta.env.VITE_API_URL;

function DeleteUser() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        userId: "",
        username: "",
        email: "",
        age: "",
    });
    const [inputPassword, setInputPassword] = useState("");
    const [isPasswordValid, setIsPasswordValid] = useState(false);
    const [isSocialLogin, setIsSocialLogin] = useState(false);

    // 사용자 정보 가져오기
    useEffect(() => {
        async function fetchUserData() {
            const userId = localStorage.getItem('userId');
            const username = localStorage.getItem('username');
            try {
                const response = await fetch(`${API_URL}/api/users/show/${userId}`, {
                    method: "GET",
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                setUserData(data);

                setIsSocialLogin(data.isSocialLogin); // 소셜 로그인 여부 확인
            } catch (error) {
                console.error("사용자 정보 가져오기 실패:", error);
            }
        }
        fetchUserData();
    }, []);

    // 회원 정보 탈퇴 로직
    const deleteUser = async () => {
        const userId = localStorage.getItem('userId');
        const username = localStorage.getItem('username');

        try {
            let response;
            if (isSocialLogin) {
                // 소셜 로그인 사용자 삭제 API 호출
                response = await fetch(`${API_URL}/api/users/delete/social_user/${username}`, {
                    method: "DELETE",
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                });
            } else {
                // 일반 사용자 삭제 API 호출
                response = await fetch(`${API_URL}/api/users/delete/${userId}`, {
                    method: "DELETE",
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                });
            }

            if (response.ok) {
                Swal.fire({
                    title: "회원 탈퇴가 완료되었습니다.",
                    icon: "success",
                    showConfirmButton: false,
                    timer: 1500
                });
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                localStorage.removeItem('username');
                navigate('/');
            } else {
                Swal.fire({
                    title: "회원 탈퇴에 실패했습니다.",
                    icon: "error",
                });
            }
        } catch (error) {
            console.error("회원 탈퇴 중 오류 발생:", error);
            Swal.fire({
                title: "회원 탈퇴 중 오류가 발생했습니다.",
                icon: "error",
            });
        }
    };

    // 비밀번호 확인 로직 (일반 로그인 사용자 전용)
    const handleVerifyPassword = async () => {
        event.preventDefault(); // 기본 폼 제출을 방지
        try {
            const response = await fetch(`${API_URL}/api/users/verify-password`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: userData.userId,
                    password: inputPassword
                })
            });

            if (response.ok) {
                setIsPasswordValid(true);
                console.log("비밀번호 일치");
            } else {
                setIsPasswordValid(false);
                Swal.fire({
                    title: "비밀번호가 일치하지 않습니다.",
                    icon: "error"
                });
            }
        } catch (error) {
            console.error("비밀번호 확인 중 오류: ", error);
            Swal.fire({
                title: "비밀번호 확인 중 오류가 발생했습니다.",
                icon: "error",
            });
        }
    };

    return (
        <>
            <h2>회원 탈퇴</h2>
            <p>회원 탈퇴를 진행할 시 여태까지의 기록이 전부 삭제됩니다.</p>
            <p>회원 탈퇴를 진행하시겠습니까?</p>

            {isSocialLogin ? (
                // 소셜 로그인 사용자 UI
                <>
                    <button onClick={deleteUser}>회원 탈퇴</button>
                    <button onClick={() => navigate('/myPage')}>취소</button>
                </>
            ) : (
                // 일반 로그인 사용자 UI
                <form onSubmit={handleVerifyPassword}>
                    <label>비밀번호:</label>
                    <input
                        type="password"
                        placeholder="비밀번호 입력"
                        value={inputPassword}
                        onChange={(e) => setInputPassword(e.target.value)}
                    />
                    <button onClick={handleVerifyPassword}>비밀번호 확인</button>
                    <button onClick={deleteUser} disabled={!isPasswordValid}>회원 탈퇴</button>
                    <button onClick={() => navigate('/myPage')}>취소</button>
                </form>
            )}
        </>
    );
}

export default DeleteUser;
