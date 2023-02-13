import SidebarItem from "./SidebarItem";
import { MdSpaceDashboard } from "react-icons/md";
import { GiFarmTractor, GiToken } from "react-icons/gi";
import { HiDocumentText } from "react-icons/hi";
import { AiOutlineExport } from "react-icons/ai";
import { FaExchangeAlt } from "react-icons/fa";
import { RiFundsLine } from "react-icons/ri";
import logo from "src/assets/images/logo.png";
import logo2 from "src/assets/images/logo-4x.png";
import LightModeToggle from "src/components/LightModeToggle/LightModeToggle";
import "./Sidebar.css";
import { useNavigate, useLocation } from "react-router-dom";
import { RoutesPaths } from "src/config/constants";
import useApp from "src/hooks/useApp";

function Sidebar() {
    const { lightMode } = useApp();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    return (
        <div className={`sidebar_bg ${lightMode && "sidebar_bg--light"}`}>
            <img className="contrax_logo" alt="contrax-logo" src={lightMode ? logo2 : logo} />

            <div className="side_items">
                <SidebarItem
                    title="Dashboard"
                    icon={<MdSpaceDashboard />}
                    onClick={() => navigate(RoutesPaths.Home)}
                    active={pathname === RoutesPaths.Home.split("?")[0]}
                />

                <SidebarItem
                    title="Farms"
                    icon={<GiFarmTractor />}
                    onClick={() => navigate(RoutesPaths.Farms)}
                    active={pathname === RoutesPaths.Farms}
                />

                <SidebarItem
                    title="Exchange"
                    icon={<FaExchangeAlt />}
                    onClick={() => navigate(RoutesPaths.Exchange)}
                    active={pathname === RoutesPaths.Exchange}
                />

                {/* <SidebarItem
                    title="Create Token"
                    icon={<GiToken />}
                    onClick={() => navigate(RoutesPaths.CreateToken)}
                    active={pathname === RoutesPaths.CreateToken}
                /> */}

                {/* <SidebarItem
                    title="Create Pool"
                    icon={<RiFundsLine />}
                    onClick={() => navigate(RoutesPaths.CreatePool)}
                    active={pathname === RoutesPaths.CreatePool}
                /> */}

                <SidebarItem
                    title="User Guide"
                    onClick={() => window.open("https://contrax.gitbook.io/contrax-docs/", "_blank")}
                    icon={<HiDocumentText />}
                    icon2={<AiOutlineExport />}
                    // active={menuItem === "Docs"}
                />
            </div>

            <div className="toggle_placement">
                <LightModeToggle />
            </div>
        </div>
    );
}

export default Sidebar;
