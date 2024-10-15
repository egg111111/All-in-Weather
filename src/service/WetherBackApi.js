import axios from "axios";

const SERVER_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

export const signUp = async(userData) => {
    try{
        const response = await axios.post(`${SERVER_URL}/api/signup`, userData);
        return response.data;
    }catch(error){
        throw error.response ? error.response.data : new Error("회원가입 중 오류가 발생했습니다.");
    }
}

export const log_in = async(loginData) => {
    try{
        const response = await axios.post(`${SERVER_URL}/api/signup`, userData );
        return response.data;
    }catch(error){
        throw error.response ? error.response.data : new Error("로그인 중 오류가 발생했습니다.");
    }
}