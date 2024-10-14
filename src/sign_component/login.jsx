import React, {useState, useEffect} from "react";
import { useDispatch } from "react-redux";

function login(){
    const dispatch = useDispatch();

    const [id, setId] = useState("");
    const [password, setPassword] = useState("");

    useEffect(()=> {

    }, [])

    const LoginResult = (e) => {
        e.preventDefault();
    } 

    const handleChangeId = (e) => {
        setId(e.target.value);
    }

    const handleChangePw = (e) => {
        setPassword(e.target.value);
    }

    return(
        <>
            <h1>로그인</h1>
            <form onSubmit={LoginResult}>
                <label htmlFor="id">ID </label>
                <input type="text" id="id"/>

                <label htmlFor="password">Password </label>
                <input type="password" />

                <button type="submit">로그인</button>
            </form>           
        </>
    )

}

export default login;