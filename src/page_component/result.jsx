import React from "react";
import { useLocation } from "react-router-dom";
import ChatgptApi from "../service/chatgptApi";
import loading from "../header_footer/loading";

function result() {
    const location = useLocation();
    const { result, type } = location.state || { result: null, type: null };

    return (
        <div>
            <h2>{type} 결과</h2>
            <p>{result}</p>
        </div>
    );
}

export default result;