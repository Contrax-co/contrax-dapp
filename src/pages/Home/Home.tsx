import { useState } from "react";
import Sidebar from "src/components/Sidebar/Sidebar";
import TopBar from "src/components/Topbar/TopBar";
import { Outlet } from "react-router-dom";
import useApp from "src/hooks/useApp";
import { MdCancel } from "react-icons/md";
import { useSelector } from "react-redux";
import { RootState } from "src/state";
import "./Home.css";
import { Maintainance } from "src/components/modals/MaintainanceModal/Maintainance";

function Home() {
    const { lightMode, supportChat, toggleSupportChat } = useApp();
    const [openBurgerMenu, setOpenBurgerMenu] = useState(false);
    const isError = useSelector((state: RootState) => state.error.isError);
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
                    <TopBar setOpenBurgerMenu={setOpenBurgerMenu} />
                    <Outlet />
                    {supportChat && (
                        <MdCancel
                            className="supportChat-close"
                            color="#63cce0"
                            cursor="pointer"
                            onClick={toggleSupportChat}
                        />
                    )}
                </div>
            </div>
            {isError && <Maintainance />}
        </div>
    );
}

export default Home;
