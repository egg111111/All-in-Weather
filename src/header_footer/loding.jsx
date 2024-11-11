import React from "react";
import Spinner from "../assets/images/Spinner.gif"

function londing() {
    return(
        <>
            <p>잠시만 기다려주세요</p>
            <img src={Spinner} alt="로딩중" width="50px"></img>
        </>
    )
}

export default londing;