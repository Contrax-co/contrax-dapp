import { Dispatch, SetStateAction, useState } from "react";
import { TbMenu2 } from "react-icons/tb";
import "./TopBar.css";
import useApp from "src/hooks/useApp";
import useWallet from "src/hooks/useWallet";
import ConnectWalletButton from "../ConnectWalletButton/ConnectWalletButton";

function TopBar({ setOpenBurgerMenu }: { setOpenBurgerMenu: Dispatch<SetStateAction<boolean>> }) {
    const { lightMode } = useApp();

    return (
        <div className={`topbar ${lightMode && "topbar--light"}`}>
            <ConnectWalletButton />
            <TbMenu2
                className={`burger-icon ${lightMode && "burger-icon--light"}`}
                size={30}
                onClick={() => setOpenBurgerMenu((show) => !show)}
            />
        </div>
    );
}

export default TopBar;
