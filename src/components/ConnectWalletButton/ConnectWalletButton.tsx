import React, { useState } from "react";
// import WalletList from "../modals/WalletList/Walletlist";
import useWallet from "src/hooks/useWallet";

const ConnectWalletButton = () => {
    const [open, setOpen] = useState(false);
    const { displayAccount, logout, connectWallet } = useWallet();

    return (
        <div>
            <button
                style={{ width: 110, height: 40, minHeight: 40, minWidth: 104, padding: 0 }}
                className="custom-button"
                onClick={() => (displayAccount ? logout() : connectWallet())}
            >
                {displayAccount ? "Disconnect" : "Sign In/Up"}
            </button>
            {/* {open && <WalletList setOpenModal={setOpen} />} */}
        </div>
    );
};

export default ConnectWalletButton;
