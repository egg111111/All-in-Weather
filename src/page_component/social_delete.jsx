import React from "react";
import { useNavigate } from "react-router-dom";
import './social_delete.css'
import Swal from "sweetalert2";
const API_URL = import.meta.env.VITE_API_URL;

function SocialDeleteUser() {
    const navigate = useNavigate();
    const social_userId = localStorage.getItem('social_userId');

    const deleteUser = async () => {
        try {
            const response = await fetch(`${API_URL}/api/users/delete/${social_userId}`, {
                method: "DELETE",
                headers: {
                  'Content-Type': 'application/json'
              },
              credentials: 'include', // JWT 쿠키를 전송
            });

            if (response.ok) {
                Swal.fire("회원 탈퇴가 완료되었습니다.", "", "success");
                localStorage.clear(); // 모든 로컬 스토리지 삭제
                navigate('/');
            } else {
                Swal.fire("회원 탈퇴에 실패했습니다.", "", "error");
            }
        } catch (error) {
            console.error("탈퇴 중 오류:", error);
            Swal.fire("탈퇴 중 오류가 발생했습니다.", "", "error");
        }
    };

    return (
        <div className="social_delete-container">
            <h2>소셜 회원 탈퇴</h2>
            <p>정말 탈퇴하시겠습니까?</p>
            <div className="social_delete-content-button">
            <button className="social_delete-button" onClick={deleteUser}>회원 탈퇴</button>
            <button className="social_delete-button" onClick={() => navigate('/myPage')}>취소</button>
            </div>
        </div>
    );
}

export default SocialDeleteUser;
