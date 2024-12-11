import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import generalApiClient from '../service/generalApiClient'; // 일반 로그인용 API 클라이언트
import './delete.css'

import { useDispatch } from "react-redux";
import { setTitle } from "../reducers/titleSlice.js";
const API_URL = import.meta.env.VITE_API_URL;

function DeleteUser() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        userId: "",
    });
    const [inputPassword, setInputPassword] = useState("");
    const [isPasswordValid, setIsPasswordValid] = useState(false);
    const [isSocialLogin, setIsSocialLogin] = useState(false);
    const dispatch = useDispatch();
    
    useEffect(() => {
        dispatch(setTitle('회원탈퇴'));
    }, [dispatch]);

    // 사용자 정보 가져오기
    useEffect(() => {
        async function fetchUserData() {
            const userId = localStorage.getItem('userId');
            try {
                const response = await generalApiClient.get(`/api/users/show/${userId}`);
                setUserData(response.data);

                setIsSocialLogin(response.data.isSocialLogin); // 소셜 로그인 여부 확인
            } catch (error) {
                console.error("사용자 정보 가져오기 실패:", error);
            }
        }
        fetchUserData();
    }, []);

    // 회원 정보 탈퇴 로직
    const deleteUser = async () => {
        const userId = localStorage.getItem('userId');

        try {
            // 일반 사용자 삭제 API 호출
            const response = await generalApiClient.delete(`/api/users/delete/${userId}`);
        
            if (response.status === 204) {
                Swal.fire({
                    title: "회원 탈퇴가 완료되었습니다.",
                    icon: "success",
                    showConfirmButton: false,
                    timer: 1500
                });
                localStorage.removeItem('token');
                localStorage.removeItem('tokenExpiry');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('userId');
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
    const handleVerifyPassword = async (event) => {
        event.preventDefault(); // 기본 폼 제출을 방지
        try {
            const response = await generalApiClient.post(`/api/users/verify-password`, {
                userId: userData.userId,
                password: inputPassword
            });

            if (response.status === 200) {
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
        <div className="delete_container">
            <h2>회원 탈퇴</h2>
            <p>회원 탈퇴 시 이용자의 모든 개인정보가 즉시 삭제됩니다.</p>
            <p>회원 탈퇴를 진행하시겠습니까?</p>

            {isSocialLogin ? (
                // 소셜 로그인 사용자 UI
                <>
                    <button onClick={deleteUser}>회원 탈퇴</button>
                    <button onClick={() => navigate('/myPage')}>취소</button>
                </>
            ) : (
                // 일반 로그인 사용자 UI
                <div className="delete-form-container">
                <form onSubmit={handleVerifyPassword}>
                    <label>비밀번호 입력</label>
                    <br/>
                    <input
                        className="delete_input"
                        type="password"
                        placeholder="비밀번호 입력"
                        value={inputPassword}
                        onChange={(e) => setInputPassword(e.target.value)}
                    />
                    <button className="delete_button" style={{ marginLeft: '10px', marginBottom: '10px' }} onClick={handleVerifyPassword}>확인</button>
                    <br/>
                    <br/>
                    <button className="delete_button" style={{ marginRight: '10px' }} onClick={deleteUser} disabled={!isPasswordValid}>회원 탈퇴</button>
                    <button className="delete_button" onClick={() => navigate('/myPage')}>취소</button>
                </form>
                </div>
            )}
        </div>
    );
}

export default DeleteUser;
