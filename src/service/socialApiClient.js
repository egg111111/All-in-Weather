// src/service/socialApiClient.js
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;

const socialApiClient = axios.create({
    baseURL: API_URL,
    withCredentials: true, // 쿠키를 사용하여 인증 정보를 포함합니다.
});

export default socialApiClient;
