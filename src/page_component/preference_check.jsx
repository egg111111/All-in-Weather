import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import './preference_check.css';
import generalApiClient from '../service/generalApiClient'; // 일반 로그인용 API 클라이언트
import socialApiClient from '../service/socialApiClient';   // 소셜 로그인용 API 클라이언트

const imageStyleMap = {
    "/src/assets/images/style/female/vintage.jpg": "빈티지",
    "/src/assets/images/style/female/classic.jpg": "클래식",
    "/src/assets/images/style/female/casual.jpg": "스마트캐주얼",
    "/src/assets/images/style/female/office.jpg": "비즈니스캐주얼",
    "/src/assets/images/style/female/feminine.jpg": "페미닌",
    "/src/assets/images/style/female/minimal.jpg": "미니멀",
    "/src/assets/images/style/female/street.jpg": "스트릿",
    "/src/assets/images/style/female/simple_basic.jpg": "심플베이직",
    "/src/assets/images/style/female/lovely.jpg": "러블리",
    "/src/assets/images/style/male/casual.jpg": "캐주얼",
    "/src/assets/images/style/male/street.jpg": "스트릿",
    "/src/assets/images/style/male/smartCasual.jpg": "스마트캐주얼",
    "/src/assets/images/style/male/businessCasual.jpg": "비즈니스캐주얼",
    "/src/assets/images/style/male/classicFormal.jpg": "클래식포멀",
    "/src/assets/images/style/male/americanCasual.jpg": "아메리칸캐주얼",
    "/src/assets/images/style/male/outdoor.jpg": "아웃도어",
    "/src/assets/images/style/male/minimalism.jpg": "미니멀리즘",
    "/src/assets/images/style/male/avantGarde.jpg": "아방가르드",
};

const femaleImages = import.meta.glob("/src/assets/images/style/female/*.{png,jpg,jpeg,svg}", { eager: true });
const maleImages = import.meta.glob("/src/assets/images/style/male/*.{png,jpg,jpeg,svg}", { eager: true });

function PreferenceCheck() {
    const [displayedImages, setDisplayedImages] = useState([]);
    const [selectedImages, setSelectedImages] = useState([]);
    const [showWarning, setShowWarning] = useState(false);
    const navigate = useNavigate();
    
    useEffect(() => {
        const savedGender = localStorage.getItem('gender');
        if (!savedGender) return;
        const images = savedGender === "female" ? femaleImages : maleImages;
        const shuffledKeys = Object.keys(images).sort(() => 0.5 - Math.random());
        const displayed = shuffledKeys.slice(0, 9).map((key) => ({
            key,
            src: images[key].default || images[key],
        }));
        setDisplayedImages(displayed);
    }, []);
    
    const handleImageClick = (imageKey) => {
        if (selectedImages.includes(imageKey)) {
            setSelectedImages(selectedImages.filter((key) => key !== imageKey));
        } else {
            setSelectedImages([...selectedImages, imageKey]);
        }
    };

    const handleSubmit = async () => {
        if (selectedImages.length < 3) {
            setShowWarning(true);
        } else {
            setShowWarning(false);
            try {
                await fetchPreference();
                Swal.fire({
                    title: "완료!",
                    text: "회원가입이 완료되었습니다.",
                    icon: "success",
                    showConfirmButton: false,
                    timer: 1500,
                });
                navigate('/dashboard'); // 성공 시 대시보드로 이동
            } catch (error) {
                console.error("Error saving preference:", error);
                Swal.fire("오류", "취향 저장 중 문제가 발생했습니다.", "error");
            }
        }
    };

    const fetchPreference = async () => {
        const userId = localStorage.getItem("userId");
        const socialUserId = localStorage.getItem("social_userId");
        const selectedStyles = selectedImages.map((key) => imageStyleMap[key]);
        const requestBody = {
            preferences: selectedStyles,
        };

        let response;

        try {
            if (socialUserId) {
                // 소셜 로그인 사용자에 대한 요청
                response = await socialApiClient.post("/api/users/style", {
                    social_userId: socialUserId,
                    ...requestBody,
                });
            } else {
                // 일반 로그인 사용자에 대한 요청
                response = await generalApiClient.post(`/api/users/style`, {
                    userId,
                    ...requestBody,
                });
            }

            if (!response.status === 200) {
                throw new Error("Failed to save preferences");
            }
        } catch (err) {
            setError("취향 저장 중 오류가 발생했습니다.");
            throw err;
        }
    };
    
    return (
        <div className="preference-style-container">
            <h2>취향 선택</h2>
            <p>마음에 드는 옷 스타일을 3개 이상 골라주세요</p>
            <br/>

            <div className="image-grid">
                {displayedImages.map(({ key, src }, index) => (
                    <div
                        key={index}
                        className={`image-item ${selectedImages.includes(key) ? "selected" : ""}`}
                        onClick={() => handleImageClick(key)}
                    >
                        <img className="img-cover" src={src} alt={`Style ${index + 1}`} />
                    </div>
                ))}
            </div>

            {showWarning && <p className="warning">최소 3개를 선택해주세요</p>}
            <br/>
            <button
                className="submit-button"
                onClick={handleSubmit}
                disabled={selectedImages.length < 3}
            >
                선택 완료
            </button>
        </div>
    );
}
export default PreferenceCheck;
