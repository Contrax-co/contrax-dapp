import { useState } from "react";
import Sidebar from "src/components/Sidebar/Sidebar";
import TopBar from "src/components/Topbar/TopBar";
import "./Home.css";
import { Outlet } from "react-router-dom";
import useApp from "src/hooks/useApp";
import { MdCancel } from "react-icons/md";

function Home() {
    const { lightMode, supportChat, toggleSupportChat } = useApp();
    const [openBurgerMenu, setOpenBurgerMenu] = useState(false);
    return (
        <div className={`page ${lightMode && "page--light"}`}>
            <div className="ac_page">
                <div className="sidebar">
                    <Sidebar handleClose={setOpenBurgerMenu} />
                </div>
                {openBurgerMenu && (
                    <div className="burger-menu-backdrop" onClick={() => setOpenBurgerMenu(false)}></div>
                )}
                <div className={`burger-menu ${openBurgerMenu && `burger-menu-open`}`}>
                    <Sidebar handleClose={setOpenBurgerMenu} />
                </div>

                <div className={`rightside ${lightMode && "rightside--light"}`}>
                    <div className="topbar">
                        <TopBar setOpenBurgerMenu={setOpenBurgerMenu} />
                    </div>
                    <Outlet />
                    {supportChat && (
                        <MdCancel
                            className="supportChat-close"
                            color="#61CDDF"
                            cursor="pointer"
                            onClick={toggleSupportChat}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default Home;
