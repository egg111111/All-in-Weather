import React from "react";
import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";

function id_pw_update() {
    const navigate = useNavigate();
    const [id_pwDate, setid_pwDate] = useState({
        password: ""
    })
    const [editMode, setEditMode] = useState(false);
    const [message, setMessage] = useState("");

    const {
        register,
        watch,
        formState: { isSubmitting, errors },
        handleSubmit,
    } = useForm();

    //정보 가져오기 
    useEffect(() => {
        async function fatchId() {
            const userId = localStorage.getItem(`userId`)

            try {
                const response = await fetch(`http://localhost:8080/api/users/show/${userId}`, {
                    method: "GET",
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                setid_pwDate(data);
            } catch (error) {
                console.error("사용자 정보 가져오기 실패:", error);
                console.log("Fetched token:", localStorage.getItem('token'));
                console.log("Fetched userId:", localStorage.getItem('userId'));
            }
        }
        fatchId();
    }, [])

    const handleSaveChangesPw = async () => {
        const userId = localStorage.getItem(`userId`);
        const newUserId = id_pwDate.userId;
        try {
            const response = await fetch(`http://localhost:8080/api/users/password/${userId}`, {
                method: "PUT",
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password: id_pwDate.password })
            });
            if (response.ok) {
                setEditMode(false);
                Swal.fire({
                    title: "아이디 및 비밀번호가 변경되었습니다.",
                    text: "잠시 후 메인화면으로 돌아갑니다.",
                    icon: "success",
                    showConfirmButton: false,
                    timer: 1500
                })
                navigate('/');
                handleLogout();

            } else {
                setMessage("비밀번호 수정에 실패했습니다.");
                Swal.fire({
                    title: "비밀번호 수정에 실패했습니다.",
                    icon: "error"
                })
            }
        } catch (error) {
            console.error("아이디 및 비밀번호 정보 수정 중 에러 발생:", error);
            setMessage("아이디 및 비밀번호 수정 중 오류가 발생했습니다.");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setid_pwDate({ ...id_pwDate, [name]: value });
    };

    function handleLogout() {
        localStorage.removeItem('token');
        console.log('로그아웃 성공');
        navigate('/')
    }

    return (
        <div>
            <h2> 비밀번호 수정 </h2>

            <label htmlFor="password">새 비밀번호: </label>
            <input
                name="password"
                type="password"
                id="password"
                placeholder="비밀번호 입력"
                {...register('password', {
                    required: "*비밀번호를 입력해주세요",
                    minLength: { value: 6, message: "*비밀번호는 6~20자 사이로 설정해주세요" },
                    maxLength: { value: 20, message: "*비밀번호는 6~20자 사이로 설정해주세요" }
                })}
                onClick={handleChange}
            />
            <br/>
            <label htmlFor="password2">비밀번호 확인</label>
            <input
                id="password2"
                type="password"
                placeholder="비밀번호 재입력"
                {...register('password2', {
                    required: "*비밀번호를 다시 한 번 입력해주세요",
                    validate: value => value === password || "*비밀번호가 일치하지 않습니다"
                })}
            />
            {errors.password2 && <p style={{ color: 'red' }}>{errors.password2.message}</p>}
            <br />
            <br />

            <button onClick={handleSaveChangesPw}>저장</button>
            <button onClick={() => navigate('/myPage')}>취소</button>
        </div>
    )
}

export default id_pw_update;