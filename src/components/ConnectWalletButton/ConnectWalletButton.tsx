import React, { useState } from "react";
import useWallet from "src/hooks/useWallet";
import { WalletConnectionModal } from "../modals/WalletConnectionModal/WalletConnectionModal";

const ConnectWalletButton = () => {
    const [open, setOpen] = useState(false);
    const { displayAccount, logout, connectWallet } = useWallet();

    return (
        <div>
            <button
                style={{ width: 110, height: 40, minHeight: 40, minWidth: 104, padding: 0 }}
                className="custom-button"
                onClick={() => (displayAccount ? logout() : setOpen(true))}
            >
                {displayAccount ? "Disconnect" : "Sign In/Up"}
            </button>
            {open && <WalletConnectionModal setOpenModal={setOpen} />}
        </div>
    );
};

export default ConnectWalletButton;
