import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import './preference_check.css';

const imageStyleMap = {
    "/src/assets/images/style/vintage.jpg": "빈티지",
    "/src/assets/images/style/classic.jpg": "클래식",
    "/src/assets/images/style/casual.jpg": "캐주얼",
    "/src/assets/images/style/office.jpg": "오피스룩",
    "/src/assets/images/style/feminine.jpg": "페미닌",
    "/src/assets/images/style/minimal.jpg": "미니멀",
    "/src/assets/images/style/street.jpg": "스트릿",
    "/src/assets/images/style/simple_basic.jpg": "심플베이직",
    "/src/assets/images/style/lovely.jpg": "러블리",
};

const images = import.meta.glob("/src/assets/images/style/*.{png,jpg,jpeg,svg}", { eager: true });

function PreferenceCheck() {
    const [displayedImages, setDisplayedImages] = useState([]);
    const [selectedImages, setSelectedImages] = useState([]);
    const [showWarning, setShowWarning] = useState(false);

    useEffect(() => {
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
                Swal.fire("완료!", "취향이 성공적으로 저장되었습니다.", "success");
            } catch (error) {
                console.error("Error saving preference:", error);
                Swal.fire("오류", "취향 저장 중 문제가 발생했습니다.", "error");
            }
        }
    };

    const fetchPreference = async () => {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");

        const selectedStyles = selectedImages.map((key) => imageStyleMap[key]);

        const requestBody = {
            userId,
            preferences: selectedStyles,
        };

        const response = await fetch("http://localhost:8080/api/users/style", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            throw new Error("Failed to save preferences");
        }
    };

    return (
        <div className="preference-style-container">
            <h2>취향 선택</h2>
            <p>마음에 드는 옷 스타일을 3개 이상 골라주세요</p>

            <div className="image-grid">
                {displayedImages.map(({ key, src }, index) => (
                    <div
                        key={index}
                        className={`image-item ${selectedImages.includes(key) ? "selected" : ""}`}
                        onClick={() => handleImageClick(key)}
                    >
                        <img src={src} alt={`Style ${index + 1}`} />
                    </div>
                ))}
            </div>

            {showWarning && <p className="warning">최소 3개를 선택해주세요</p>}

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
