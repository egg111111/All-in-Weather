import React from "react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setTitle } from "../reducers/titleSlice.js";

import Loading from "../header_footer/loading";
import './result.css'

function Result() {
    const location = useLocation();
    const navigate = useNavigate();
    const { result, imageUrl, type, loading, imageLoading } = location.state || { result: null, imageUrl: null, type: null, loading: true, imageLoading: true };
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setTitle('옷차림 추천'));
    }, [dispatch]);

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
        <div className="result-container">
            <h2 className="result-title">{type}</h2>
            {loading ? (
                <Loading />
            ) : (
                <>
                    {/* 줄바꿈 처리 */}
                    <div
                        className="result-content-main"
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
            <br/>
            <div className="result-content-button">
                <button className="result-real-button" onClick={() => navigate('/dashboard')}> 돌아가기 </button>
                <button className="result-real-button" onClick={() => navigate('/recView')}> 기록 보러 가기 </button>
            </div>
        </div>
    );
}

export default Result;
