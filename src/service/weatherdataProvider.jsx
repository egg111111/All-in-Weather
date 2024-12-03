import React from "react";
import { createContext, useState } from "react";

export const WeatherdataContext = createContext();

export const WeatherdataProvider = ({children}) => {
    const [currentWeather, setCurrentWeather] = useState(null);

    return(
        <WeatherdataContext.Provider value={{currentWeather, setCurrentWeather}}>
            {children}
        </WeatherdataContext.Provider>
    )
}

export const useWeather = () => useContext(WeatherdataContext);