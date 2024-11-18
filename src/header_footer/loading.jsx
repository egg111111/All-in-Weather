import React from "react";
import Spinner from "../assets/images/Spinner.gif"

function Loading() {
    return(
        <>
            <p>잠시만 기다려주세요</p>
            <img src={Spinner} alt="로딩중" width="5%"></img>
        </>
    )
}

export default Loading;