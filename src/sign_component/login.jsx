import React, { useState, useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";


function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");


    const handleLogin = async (e) => {
        e.preventDefault();
        const loginData = { username, password };

        try {
            const response = await fetch('http://localhost:8080/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(loginData),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('로그인 성공:', data);

                // 로그인 성공 시 토큰 저장 
                localStorage.getItem('token', data.token);

                // 사용자의 정보를 Redux에 저장
                //dispatch(loginSuccess(data));

                // 로그인 성공 후 이동할 페이지로 리다이렉트
                navigate('/dashboard');
            } else {
                const errorData = await response.json();
                setError(errorData.message || '로그인에 실패했습니다.');
            }
        } catch (error) {
            console.error('로그인 중 에러 발생:', error);
            setError('서버와의 연결이 원활하지 않습니다. 다시 시도해주세요.');
        }
    };


    return (
        <>
            <h1>로그인</h1>
            <form onSubmit={handleLogin}>
                <label htmlFor="username">username </label>
                <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />

                <label htmlFor="password">Password </label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button type="submit">로그인</button>
            </form>        
        </>
    );
}


export default Login;
