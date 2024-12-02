import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Loading from "../header_footer/loading";

function Result() {
    const location = useLocation();
    const navigate = useNavigate();
    const { result, imageUrl, type, loading, imageLoading } = location.state || { result: null, imageUrl: null, type: null, loading: true, imageLoading: true };

    // 디버깅: 데이터 확인
    console.log("Location 데이터:", location.state);
    console.log("Result 데이터:", result);

    // 줄바꿈을 <br /> 태그로 변환
    let formattedResult = "";
    if (result) {
        formattedResult = result.replace(/(\d\.\s?)/g, "<br />$1");
        console.log("Formatted Result 생성됨:", formattedResult); // 디버깅: 최종 결과 확인
    }

    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
            <h2>{type}</h2>
            {loading ? (
                <Loading />
            ) : (
                <>
                    {/* 줄바꿈 처리 */}
                    <div
                        dangerouslySetInnerHTML={{ __html: formattedResult }}
                        style={{ textAlign: "left", lineHeight: "1.8" }} // 줄 간격 조절
                    />
                    {imageLoading ? (
                        <p>이미지 생성 중입니다. 잠시만 기다려 주세요...</p>
                    ) : (
                        imageUrl && <img src={imageUrl} alt="Recommended Outfit" style={{ maxWidth: "100%", marginTop: "20px" }} />
                    )}
                </>
            )}
            <button onClick={() => navigate('/dashboard')}> 돌아가기 </button>
            <button onClick={() => navigate('/recView')}> 기록 보러 가기 </button>
        </div>
    );
}

export default Result;
