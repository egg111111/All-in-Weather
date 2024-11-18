import React from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function result() {
    const location = useLocation();
    const { result, type, gptImage } = location.state || { result: null, type: null, gptImage:null };
    const navigate = useNavigate();

    return (
        <div>
            <h2>{type} 결과</h2>
            <p>{result}</p>
            <img src={gptImage} alt="Generated Outfit" style={{ maxWidth: "100%" }}/>

            <button onClick={() =>navigate('/dashboard')}> 돌아가기 </button>
            <button onClick={() =>navigate('/recView')} > 기록 보러 가기  </button>
        </div>
    );
}

export default result;