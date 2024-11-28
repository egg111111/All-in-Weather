// generalApiClient.js
import axios from 'axios';
import Swal from 'sweetalert2';
const API_URL = import.meta.env.VITE_API_URL;

let isRefreshing = false;  // 토큰 갱신 상태
let refreshSubscribers = [];  // 토큰 갱신 후 요청을 재시도할 구독자들

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 요청 인터셉터 설정
apiClient.interceptors.request.use(
    async (config) => {
        const token = localStorage.getItem('token');
        const tokenExpiry = localStorage.getItem('tokenExpiry');

        console.log("Before Request - Token:", token);
        console.log("Before Request - Token Expiry:", tokenExpiry);
        // 액세스 토큰 만료 여부 확인
        if (tokenExpiry && new Date().getTime() > tokenExpiry) {
            if (!isRefreshing) {
                isRefreshing = true;

                console.log("post 하기전");
                const refreshToken = localStorage.getItem('refreshToken');

                try {
                    const response = await axios.post(`${API_URL}/api/users/token/refresh`, { refreshToken });
                    const newAccessToken = response.data.token;
                    const newTokenExpiry = response.data.tokenExpiry;

                    console.log("New Access Token:", newAccessToken);
                    console.log("New Token Expiry:", newTokenExpiry); 
                    // 새로 발급된 액세스 토큰과 만료 시간 저장
                    localStorage.setItem('token', newAccessToken);
                    localStorage.setItem('tokenExpiry', newTokenExpiry);

                    // 원래의 요청 재시도
                    refreshSubscribers.forEach((callback) => callback(newAccessToken));
                    refreshSubscribers = [];
                    isRefreshing = false;
                } catch (error) {
                    console.error('토큰 갱신 실패', error);
                    // 로그아웃 처리 혹은 로그인 페이지로 리다이렉트
                    refreshSubscribers = [];
                    window.location.href = '/login';
                }
            }

            return new Promise((resolve) => {
                refreshSubscribers.push((newAccessToken) => {
                    config.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    resolve(config);
                });
            });
        }

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
/* 
토큰 유효성 검사 및 갱신:
    요청 인터셉터는 요청이 서버로 전송되기 전에 실행됩니다.
    요청이 전송되기 전에 토큰이 만료되었는지(tokenExpiry) 확인합니다.
    만약 토큰이 만료되었다면, 토큰 갱신을 시도합니다.
토큰 갱신 플로우:
    isRefreshing이 false일 때만 갱신을 시도하여 중복 갱신을 방지합니다.
    갱신이 성공하면 새로운 액세스 토큰과 만료 시간을 저장합니다.
    refreshSubscribers 배열에 담긴 콜백들을 실행하여 대기 중이던 요청들을 다시 실행합니다.
    만약 갱신에 실패하면 사용자에게 로그인 페이지로 이동하도록 리다이렉트합니다.
구독 패턴 사용:
    refreshSubscribers 배열을 이용하여 토큰 갱신이 완료된 후 다시 원래의 요청을 실행하도록 합니다. 
    이 방식으로 여러 개의 요청이 동시에 토큰 갱신을 기다리도록 구현합니다.
*/

// 응답 인터셉터 설정
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        if (error.response && error.response.status === 401 && !error.config._retry) {
            error.config._retry = true;
            const refreshToken = localStorage.getItem('refreshToken');

            if (refreshToken) {
                try {
                    const response = await axios.post(`${API_URL}/api/users/token/refresh`, { refreshToken });
                    const newAccessToken = response.data.token;

                    // 새로 발급된 액세스 토큰 저장
                    localStorage.setItem('token', newAccessToken);
                    error.config.headers['Authorization'] = `Bearer ${newAccessToken}`;

                    // 원래의 요청 재시도
                    return axios(error.config);
                } catch (refreshError) {
                    console.error('토큰 갱신 실패', refreshError);

                    // Swal을 사용하여 세션 만료 알림을 표시
                    await Swal.fire({
                        title: '세션이 만료되었습니다.',
                        text: '다시 로그인 후 시도해 주세요.',
                        icon: 'warning',
                        confirmButtonText: '확인'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            // 로그아웃 처리
                            localStorage.removeItem('token');
                            localStorage.removeItem('refreshToken');
                            localStorage.removeItem('tokenExpiry');
                            window.location.href = '/login';
                        }
                    });
                }
            }
        }
        return Promise.reject(error);
    }
);
/*
응답이 성공적으로 돌아오면, 그대로 반환합니다.
401 Unauthorized 응답 처리:
    응답에서 401 에러가 발생한 경우 토큰이 만료되었거나 유효하지 않다는 것을 의미합니다.
    이때 refreshToken을 사용하여 새로운 액세스 토큰을 발급받으려고 합니다.
    새로 발급받은 액세스 토큰으로 원래의 요청을 다시 시도합니다.
토큰 갱신 실패 시:
    만약 갱신에 실패했다면, Swal을 통해 "세션이 만료되었습니다. 다시 로그인 후 시도해 주세요."라는 경고 메시지를 사용자에게 보여줍니다.
    사용자가 확인 버튼을 누르면 로그인 페이지로 리다이렉트됩니다.
*/
export default apiClient;
