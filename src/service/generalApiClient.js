import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
    baseURL: API_URL, // Vite에서 환경 변수를 사용 (e.g., .env 파일에 설정)
    headers: {
        'Content-Type': 'application/json',
    },
});

// 요청 인터셉터 설정
apiClient.interceptors.request.use(
    async (config) => {
        const token = localStorage.getItem('token');
        const refreshToken = localStorage.getItem('refreshToken');
        const tokenExpiry = localStorage.getItem('tokenExpiry');

        // 액세스 토큰 만료 여부 확인
        if (tokenExpiry && new Date().getTime() > tokenExpiry) {
            try {
                const response = await axios.post('http://localhost:8080/api/users/token/refresh', { refreshToken });
                const newAccessToken = response.data.token;

                // 새로 발급된 액세스 토큰과 만료 시간 저장
                localStorage.setItem('token', newAccessToken);
                localStorage.setItem('tokenExpiry', response.data.tokenExpiry);

                config.headers['Authorization'] = `Bearer ${newAccessToken}`;
            } catch (error) {
                console.error('토큰 갱신 실패', error);
                // 로그아웃 처리 혹은 로그인 페이지로 리다이렉트
                window.location.href = '/login';
            }
        } else if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 응답 인터셉터 설정
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        if (error.response.status === 401) {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                try {
                    const response = await axios.post('http://localhost:8080/api/users/token/refresh', { refreshToken });
                    const newAccessToken = response.data.token;

                    // 새로 발급된 액세스 토큰 저장
                    localStorage.setItem('token', newAccessToken);
                    error.config.headers['Authorization'] = `Bearer ${newAccessToken}`;

                    // 원래의 요청 재시도
                    return axios(error.config);
                } catch (refreshError) {
                    console.error('토큰 갱신 실패', refreshError);
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
