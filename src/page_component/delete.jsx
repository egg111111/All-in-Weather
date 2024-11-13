<<<<<<< HEAD
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
const API_URL = import.meta.env.VITE_API_URL;

function DeleteUser() {
=======
import React from "react";
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";

function delete_user() {
>>>>>>> 9207541e5f044c8bbc0c9160ef8f8c4d9a2f76cd
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        userId: "",
        username: "",
        email: "",
        age: "",
<<<<<<< HEAD
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
=======
        // job: ""
    });
    const [inputPassword, setInputPassword] = useState("");
    const [isPasswordValid, setIsPasswordValid] = useState(false);
    const {
        register,
        watch,
        formState: { isSubmitting, errors },
        handleSubmit,
    } = useForm();

    //사용자 정보 가져오기 
    useEffect(() => {

        async function fetchUserData() {
            const userId = localStorage.getItem('userId');

            try {
                const response = await fetch(`http://localhost:8080/api/users/show/${userId}`, {
>>>>>>> 9207541e5f044c8bbc0c9160ef8f8c4d9a2f76cd
                    method: "GET",
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                setUserData(data);
<<<<<<< HEAD
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
=======
            } catch (error) {
                console.error("사용자 정보 가져오기 실패:", error);
                console.log("Fetched token:", localStorage.getItem('token'));
                console.log("Fetched username:", localStorage.getItem('userId'));
            }
        }

        fetchUserData();
    }, []);

    //회원 정보 탈퇴 로직 
    const deleteUser = async () => {
        const userId = localStorage.getItem('userId');
        try {
            const response = await fetch(`http://localhost:8080/api/users/delete/${userId}`, {
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userID: userData.userId, 
                    password: inputPassword
                }) 
            });
>>>>>>> 9207541e5f044c8bbc0c9160ef8f8c4d9a2f76cd

            if (response.ok) {
                Swal.fire({
                    title: "회원 탈퇴가 완료되었습니다.",
                    icon: "success",
                    showConfirmButton: false,
                    timer: 1500
                });
<<<<<<< HEAD
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                localStorage.removeItem('username');
                navigate('/');
            } else {
=======

                setIsPasswordValid(true);
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                navigate('/');
            } else {
                setIsPasswordValid(false);
                console.error('회원 탈퇴에 실패했습니다.');
>>>>>>> 9207541e5f044c8bbc0c9160ef8f8c4d9a2f76cd
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

<<<<<<< HEAD
    // 비밀번호 확인 로직 (일반 로그인 사용자 전용)
    const handleVerifyPassword = async () => {
        try {
            const response = await fetch(`${API_URL}/api/users/verify-password`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
=======
    const handleVerifyPassword = async() => {
        try {
            const response = await fetch(`http://localhost:8080/api/users/verify-password`, {
                method:"POST",
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }, 
>>>>>>> 9207541e5f044c8bbc0c9160ef8f8c4d9a2f76cd
                body: JSON.stringify({
                    userId: userData.userId,
                    password: inputPassword
                })
            });

<<<<<<< HEAD
            if (response.ok) {
=======
            if(response.ok){
>>>>>>> 9207541e5f044c8bbc0c9160ef8f8c4d9a2f76cd
                setIsPasswordValid(true);
            } else {
                setIsPasswordValid(false);
                Swal.fire({
<<<<<<< HEAD
                    title: "비밀번호가 일치하지 않습니다.",
                    icon: "error"
                });
            }
        } catch (error) {
=======
                    title:"비밀번호가 일치하지 않습니다.",
                    icon: "error"
                })
            }
        } catch(error){
>>>>>>> 9207541e5f044c8bbc0c9160ef8f8c4d9a2f76cd
            console.error("비밀번호 확인 중 오류: ", error);
            Swal.fire({
                title: "비밀번호 확인 중 오류가 발생했습니다.",
                icon: "error",
            });
        }
<<<<<<< HEAD
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
=======
    }


    return (
        <>
            <h2> 회원 탈퇴 </h2>
            <p> 회원 탈퇴를 진행할 시 여태까지의 기록이 전부 삭제됩니다. </p>
            <p> 회원 탈퇴를 진행하시겠습니까? </p>

            <form onSubmit={handleSubmit(handleVerifyPassword)}>
                <label> password: </label>
                <input
                    type="password"
                    placeholder="비밀번호 입력"
                    {...register('password', {
                        required: "비밀번호를 입력해주세요"
                    })}
                    value={inputPassword}
                    onChange={(e) => setInputPassword(e.target.value)}
                />
                <button onClick={handleVerifyPassword}> 비밀번호 확인 </button>

                <button onClick={deleteUser} disabled={!isPasswordValid}>회원 탈퇴</button>
                <button onClick={() => navigate('/myPage')}>취소</button>
            </form>

        </>
    )
}

export default delete_user;
>>>>>>> 9207541e5f044c8bbc0c9160ef8f8c4d9a2f76cd
