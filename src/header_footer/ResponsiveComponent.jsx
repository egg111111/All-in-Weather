import React from "react";
import { useMediaQuery } from "react-responsive";

const Mobile = ({children}) => {
    const isMobile = useMediaQuery({
        query: "(max-width:576px)"
    });
    
    return(
        <div>
            {isMobile && children}
        </div>
    )
}

const tablet = ({children}) => {
    const isTablet = useMediaQuery({
        query: "(min-witdh:576px) and (max-witdh:768px)"
    })

    return(
        <div>
            {isTablet && children}
        </div>
    )
}

const PC = ({children}) => {
    const isPc = useMediaQuery({
        query: "(min-witdh:768px)"
    })
}

export default [Mobile, tablet, PC];