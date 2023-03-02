import SidebarItem from "./SidebarItem";
import { MdSpaceDashboard } from "react-icons/md";
import { GiFarmTractor } from "react-icons/gi";
import { HiDocumentText } from "react-icons/hi";
import { AiOutlineExport } from "react-icons/ai";
import { FaExchangeAlt } from "react-icons/fa";
import logo from "src/assets/images/logo.png";
import logo2 from "src/assets/images/logo-4x.png";
import LightModeToggle from "src/components/LightModeToggle/LightModeToggle";
import "./Sidebar.css";
import { useNavigate, useLocation } from "react-router-dom";
import { RoutesPaths } from "src/config/constants";
import useApp from "src/hooks/useApp";
import { Dispatch, SetStateAction } from "react";

function Sidebar({ handleClose }: { handleClose: Dispatch<SetStateAction<boolean>> }) {
    const { lightMode } = useApp();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const handleNavigation = (route: string, target?: string) => {
        if (target) window.open(route, target);
        else navigate(route);
        handleClose(false);
    };

    return (
        <div className={`sidebar_bg ${lightMode && "sidebar_bg--light"}`}>
            <img className="contrax_logo" alt="contrax-logo" src={lightMode ? logo2 : logo} />

            <div className="side_items">
                <SidebarItem
                    title="Dashboard"
                    icon={<MdSpaceDashboard />}
                    onClick={() => handleNavigation(RoutesPaths.Home)}
                    active={pathname === RoutesPaths.Home}
                />

                <SidebarItem
                    title="Farms"
                    icon={<GiFarmTractor />}
                    onClick={() => handleNavigation(RoutesPaths.Farms)}
                    active={pathname === RoutesPaths.Farms}
                />

                <SidebarItem
                    title="Exchange"
                    icon={<FaExchangeAlt />}
                    onClick={() => handleNavigation(RoutesPaths.Exchange)}
                    active={pathname === RoutesPaths.Exchange}
                />

                {/* <SidebarItem
                    title="Create Token"
                    icon={<GiToken />}
                    onClick={() => handleNavigation(RoutesPaths.CreateToken)}
                    active={pathname === RoutesPaths.CreateToken}
                /> */}

                {/* <SidebarItem
                    title="Create Pool"
                    icon={<RiFundsLine />}
                    onClick={() => handleNavigation(RoutesPaths.CreatePool)}
                    active={pathname === RoutesPaths.CreatePool}
                /> */}

                <SidebarItem
                    title="User Guide"
                    onClick={() => handleNavigation("https://contrax.gitbook.io/contrax-docs/", "_blank")}
                    icon={<HiDocumentText />}
                    icon2={<AiOutlineExport />}
                />
            </div>

            <div>
                <LightModeToggle />
            </div>
        </div>
    );
}

export default Sidebar;
