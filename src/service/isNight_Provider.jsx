import React from "react";
import { createContext, useState } from "react";

export const IsNightContext = createContext();

export const IsNightProvider = ({children}) => {
    const [isNight, setIsNight] = useState(false);
    return(
        <IsNightContext.Provider value={{isNight, setIsNight}}>
            {children}
        </IsNightContext.Provider>
    )
}