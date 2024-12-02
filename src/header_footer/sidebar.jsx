import React from "react";
import { useEffect, useState, useRef, useContext } from "react";
import styles from './sidebar.module.css';
import { IsNightContext } from '../service/isNight_Provider';

const sidebar = ({ width=280, children }) =>{
    const [isOpen, setOpen] = useState(false);
    const [xPosition, setxPosition] = useState(-width);
    const side = useRef();
    const { isNight } = useContext(IsNightContext);

    const toggleMenu = () => {
        setxPosition(isOpen ? -width : 0);
        setOpen(!isOpen);
    };

    const handleClose = async(e)=>{
        const sideArea = side.current;
        const sideCildren = side.current.contains(e.target);
        if (isOpen && side.current && !side.current.contains(e.target)) {
            setxPosition(-width);
            setOpen(false);
        }
    }

    const handleMenuClick = () => {
        setxPosition(-width);
        setOpen(false);
    }


    useEffect(() => {
        window.addEventListener('click', handleClose);
        return () => {
          window.removeEventListener('click', handleClose);
        };
    }, [isOpen])

    return(
        <div className={styles.container}>
            <div ref={side} className={styles.sidebar} 
            style={{
                width: `${width}px`, 
                height: `100%`, 
                transform: `translateX(${-xPosition}px)`, 
                backgroundColor: isNight ?  "#E8E3F1" : "#E3ECF1",
            }}>
                <button onClick={()=>toggleMenu()} className={styles.button}>
                    {isOpen ? 
                    <span> X </span> : <span> ☰ </span>
                    }
                </button>
                    <div className={styles.content} onClick={() => handleMenuClick()}> {children} </div>
            </div>
        </div>
    )
}

export default sidebar;