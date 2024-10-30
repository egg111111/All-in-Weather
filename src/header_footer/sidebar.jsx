import React from "react";
import { useEffect, useState } from "react";

const sidebar = ({ width=280, children }) =>{
    const [isOpen, setOpen] = useState(false);
    const [xPosition, setxPosition] = useState(-width);

    const toggleMenu = () => {
        if (xPosition < 0) {
            setxPosition(0)
            setOpen(true);
        } else{
            setxPosition(-width);
            setOpen(false);
        }
    };

    const handleClose = async(e)=>{
        const sideArea = side.current;
        const sideCildren = side.current.contains(e.target);
        if(isOpen && (!sideArea || !sideCildren)){
            await setxPosition(-width);
            await setOpen(false);
        }
    }

    useEffect(() => {
        window.addEventListener('click', handleClose);
        return () => {
          window.removeEventListener('click', handleClose);
        };
    })

    return(
        <>
        </>
    )
}

export default sidebar;