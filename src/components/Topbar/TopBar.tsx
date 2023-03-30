import { Dispatch, SetStateAction } from "react";
import { TbMenu2 } from "react-icons/tb";
import "./TopBar.css";
import useApp from "src/hooks/useApp";
import { ConnectButton } from "@rainbow-me/rainbowkit";

function TopBar({ setOpenBurgerMenu }: { setOpenBurgerMenu: Dispatch<SetStateAction<boolean>> }) {
    const { lightMode } = useApp();

    return (
        <div className={`topbar ${lightMode && "topbar--light"}`}>
            <ConnectButton label="Sign In/Up" />
            <TbMenu2
                className={`burger-icon ${lightMode && "burger-icon--light"}`}
                size={30}
                onClick={() => setOpenBurgerMenu((show) => !show)}
            />
        </div>
    );
}

export default TopBar;
