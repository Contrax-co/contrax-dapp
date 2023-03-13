import { Dispatch, SetStateAction } from "react";
import { TbMenu2 } from "react-icons/tb";
import "./TopBar.css";
import useApp from "src/hooks/useApp";
import { ConnectButton } from "@rainbow-me/rainbowkit";

function TopBar({ setOpenBurgerMenu }: { setOpenBurgerMenu: Dispatch<SetStateAction<boolean>> }) {
    const { lightMode } = useApp();

    return (
        <div className="topbar_placement">
            <div
                className={`topbar_menu ${lightMode && "topbar_menu--light"}`}
                onClick={() => setOpenBurgerMenu((show) => !show)}
            >
                <TbMenu2 className="burger-icon" />
            </div>
            <div style={{ flex: 1 }}></div>
            <div>
                <ConnectButton label="Get Started" />
            </div>
        </div>
    );
}

export default TopBar;
