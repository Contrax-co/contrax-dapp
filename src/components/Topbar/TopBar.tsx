import { Dispatch, SetStateAction } from "react";
import { TbMenu2 } from "react-icons/tb";
import "./TopBar.css";
import useApp from "src/hooks/useApp";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import useWallet from "src/hooks/useWallet";

function TopBar({ setOpenBurgerMenu }: { setOpenBurgerMenu: Dispatch<SetStateAction<boolean>> }) {
    const { lightMode } = useApp();
    const { connectBiconomy, logout } = useWallet();

    return (
        <div className={`topbar ${lightMode && "topbar--light"}`}>
            <button className="custom-button" onClick={() => logout()}>
                Logout
            </button>
            <button className="custom-button" onClick={() => connectBiconomy()}>
                Biconomy
            </button>
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
