import React from "react";
import { createContext, useState } from "react";

export const UserDataContext = createContext();

export const UserDataProvider = ({children}) => {
    const [userInfo, setUserInfo] = useState(null);

    return(
        <UserDataContext.Provider value={{userInfo, setUserInfo}}>
            {children}
        </UserDataContext.Provider>
    )
}