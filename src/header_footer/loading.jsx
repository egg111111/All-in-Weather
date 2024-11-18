import React from "react";import { HashLoader } from "react-spinners";

import Spinner from "../assets/images/Spinner.gif"

const modalStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "120vh",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // 반투명 배경
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000, 
    
}

const loaderStyle = {
    textAlign: "center",
    color: "#fff"
}

function Loading() {
    return(
        // <>
        //     <p>잠시만 기다려주세요</p>
        //     <img src={Spinner} alt="로딩중" width="50px"></img>
        // </>
        <div style={modalStyle}>
            <div style={loaderStyle}>
                <HashLoader color="#fff" loading={true} size={70} />
                <p> 잠시만 기다려주세요 </p>
            </div>
        </div>
    )
}

export default Loading;