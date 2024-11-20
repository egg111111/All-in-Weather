import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Loading from "../header_footer/loading";

function Result() {
    const location = useLocation();
    const navigate = useNavigate();
    const { result, imageUrl, type, loading, imageLoading } = location.state || { result: null, imageUrl: null, type: null, loading: true, imageLoading: true };

    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
            <h2>{type}</h2>
            {loading ? (
                <Loading/>
            ) : (
                <>
                    <p>{result}</p>
                    {imageLoading ? (
                        <p>이미지 생성 중입니다. 잠시만 기다려 주세요...</p>
                    ) : (
                        imageUrl && <img src={imageUrl} alt="Recommended Outfit" style={{ maxWidth: "100%", marginTop: "20px" }} />
                    )}
                </>
            )}
            <button onClick={() =>navigate('/dashboard')}> 돌아가기 </button>
            <button onClick={() =>navigate('/recView')} > 기록 보러 가기  </button>
        </div>
    );
}

export default Result;
