import React from "react"

const Header = () => {
    return(
        <div>
            <button className="hamburger" onClick={toggleMenu}>
                {isMenuOpen ? '✖️' : '☰'} 
            </button>
        </div>
    )
}

export default Header;