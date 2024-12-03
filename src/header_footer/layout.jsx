import React from "react";
import Header from "./header";

const Layout = (props) =>{
    return(
        <div>
            <Header></Header>
            <main>
                {props.children}
            </main>
        </div>
    )
}

export default Layout;