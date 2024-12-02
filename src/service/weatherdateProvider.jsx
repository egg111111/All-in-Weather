import React from "react";
import { createContext, useState } from "react";

export const WeatherdateContext = createContext();

export const WeatherdateProvider = ({children}) => {
    const [userDate, setUserDate] = useState(null);

    return(
        <WeatherdateContext.Provider value={{userDate, setUserDate}}>
            {children}
        </WeatherdateContext.Provider>
    )
}