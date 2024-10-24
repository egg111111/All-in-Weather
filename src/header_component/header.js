import React from "react"
import { useState, useEffect } from "react"

const header = () => {
    return(
        <div>
            <button className="hamburger" onClick={toggleMenu}>
                {isMenuOpen ? '✖️' : '☰'} 
            </button>
        </div>
    )
}