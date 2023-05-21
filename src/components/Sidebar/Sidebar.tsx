import SidebarItem from "./SidebarItem";
import { MdSpaceDashboard } from "react-icons/md";
import { HiDocumentText } from "react-icons/hi";
import { AiOutlineExport } from "react-icons/ai";
import { FaExchangeAlt } from "react-icons/fa";
import { BsCurrencyExchange } from "react-icons/bs";
import { ReactComponent as EarnIcon } from "src/assets/images/earn.svg";
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
                    icon={<MdSpaceDashboard size={18} />}
                    onClick={() => handleNavigation(RoutesPaths.Home)}
                    active={pathname === RoutesPaths.Home}
                />

                <SidebarItem
                    title="Buy"
                    icon={<BsCurrencyExchange size={18} />}
                    onClick={() => handleNavigation(RoutesPaths.Buy)}
                    active={pathname === RoutesPaths.Buy}
                />

                <SidebarItem
                    title="Earn"
                    icon={<EarnIcon height={18} width={18} />}
                    onClick={() => handleNavigation(RoutesPaths.Farms)}
                    active={pathname === RoutesPaths.Farms}
                />

                <SidebarItem
                    title="Exchange"
                    icon={<FaExchangeAlt size={18} />}
                    onClick={() => handleNavigation(RoutesPaths.Exchange)}
                    active={pathname === RoutesPaths.Exchange}
                />

                {process.env.NODE_ENV === "development" && (
                    <SidebarItem
                        title="Test"
                        icon={<BsCurrencyExchange size={18} />}
                        onClick={() => handleNavigation("/test")}
                        active={pathname === "/test"}
                    />
                )}
                <SidebarItem
                    title="User Guide"
                    onClick={() => handleNavigation("https://contrax.gitbook.io/contrax-docs/", "_blank")}
                    icon={<HiDocumentText size={18} />}
                    icon2={<AiOutlineExport size={12} />}
                />
            </div>

            <div className="sidebar_footer">
                <LightModeToggle />
            </div>
        </div>
    );
}

export default Sidebar;
