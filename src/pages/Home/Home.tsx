import { useState } from "react";
import Sidebar from "src/components/Sidebar/Sidebar";
import TopBar from "src/components/Topbar/TopBar";
import "./Home.css";
import Logout from "src/components/Logout/Logout";
import { Outlet } from "react-router-dom";
import useApp from "src/hooks/useApp";
import useWallet from "src/hooks/useWallet";
import useVaultBalances from "src/hooks/vaults/useVaultBalances";
import useConstants from "src/hooks/useConstants";

function Home() {
    const { lightMode } = useApp();
    const [open, setOpen] = useState(false);
    useConstants();

    return (
        <div className={`page ${lightMode && "page--light"}`}>
            <div className="ac_page">
                <div className="sidebar">
                    <Sidebar />
                </div>

                <div className={`rightside ${lightMode && "rightside--light"}`}>
                    <div className="topbar">
                        <TopBar openModal={() => setOpen(true)} />
                    </div>
                    <Outlet />
                </div>
            </div>

            {open && <Logout onClose={() => setOpen(false)} />}
        </div>
    );
}

export default Home;
