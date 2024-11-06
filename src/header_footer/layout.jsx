import React from "react";
import Header from "./header";
import Sidebar from "./sidebar";

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