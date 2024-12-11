import React from "react";
import { useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setTitle } from "../reducers/titleSlice.js";

import ChatgptApi from "../service/chatgptApi.jsx";

import Loading from "../header_footer/loading";
import './result.css'
import { faL } from "@fortawesome/free-solid-svg-icons";

import { WeatherdataContext } from "../service/weatherdataProvider.jsx";
import { UserDataContext } from "../service/userDataProvider.jsx";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRepeat } from "@fortawesome/free-solid-svg-icons";

function Result() {
    const location = useLocation();
    const navigate = useNavigate();
    const { result, imageUrl, type, loading, imageLoading, isRecommended } = location.state || { result: null, imageUrl: null, type: null, loading: true, imageLoading: true, isRecommended: false };
    const dispatch = useDispatch();
    const { currentWeather } = useContext(WeatherdataContext);
    const { userInfo } = useContext(UserDataContext)
    // const [isRe_Rec, SetIsRe_Rec]

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
            <br />
            <div className="result-repeat-button">
                    <ChatgptApi weatherData={currentWeather} userData={userInfo} isRe_Rec={true} />
                    
                </div>
                <p className="repeat-text">재추천</p>
            <div className="result-content-button">
                
                <br />
                <button className="result-real-button" onClick={() => navigate('/dashboard')}> 돌아가기 </button>
                <button className="result-real-button" onClick={() => navigate('/recView')}> 기록 보러 가기 </button>
            </div>

        </div>
    );
}

export default Result;
