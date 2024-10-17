import React, { useState, useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";


function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");


    const handleLogin = async (e) => {
        e.preventDefault();
        const loginData = { userId, password };

        try {
            const response = await fetch('http://localhost:8080/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData),
            });

            if (response.ok) {
                const data = await response.json();
                const token = data.token;
                console.log('로그인 성공:', data);

                // 로그인 성공 시 토큰, 유저네임 저장 
                localStorage.setItem('token', token);
                localStorage.setItem('userId', userId);
                

                // 사용자의 정보를 Redux에 저장
                //dispatch(loginSuccess(data));

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

    useEffect(() => {
        const token = localStorage.getItem('token')
        if(token){
            navigate('/dashboard');
        }
    }, [navigate])


    return (
        <>
            <h1>로그인</h1>
            <form onSubmit={handleLogin}>
                <label htmlFor="userId">ID </label>
                <input
                    type="text"
                    id="userId"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    required
                />
                <br/>

                <label htmlFor="password">Password </label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <p></p>

                <button type="submit">로그인</button>
            </form>        
        </>
    );
}


export default Login;
