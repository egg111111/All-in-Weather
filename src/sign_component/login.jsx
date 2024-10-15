import React, {useState, useEffect} from "react";
import { useDispatch } from "react-redux";
import { log_in } from "../service/wetherBackApi";

function login(){
    const dispatch = useDispatch();

    const [id, setId] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    useEffect(()=> {

    }, [])

    const LoginResult = async(e) => {
        e.preventDefault();

        try{
            const result = await log_in({id, password});

            console.log("seecuess: ", result);
            dispatch({type: "LOGIN_SUCCESS", payload: result});
        }catch(error){
            console.error("fail: ", error);
            setError(error.message || "로그인에 실패하였습니다.");
        }
    } ;

    return(
        <>
            <h1>로그인</h1>
            <form onSubmit={LoginResult}>
                <label htmlFor="id">ID </label>
                <input 
                    type="text" 
                    id="id" 
                    value={id}
                    onChange={(e) => setId(e.target.value)}/>

                <label htmlFor="password">Password </label>
                <input 
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} />

                <button type="submit">로그인</button>
            </form>
            {error && <p style={{color:'red'}}>{error}</p>}           
        </>
    )

}

export default login;