import { useState, useEffect } from "react";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { BsCheckCircle } from "react-icons/bs";
import { FiExternalLink, FiCopy } from "react-icons/fi";
import "./Dashboard.css";
import Vaults from "./JoinedVaults/Vaults";
import useWallet from "src/hooks/useWallet";
import useApp from "src/hooks/useApp";
import useVaults from "src/hooks/useVaults";
import { BLOCK_EXPLORER_URL } from "src/config/constants";
import { copyToClipboard } from "src/utils";

function Dashboard() {
    const { lightMode } = useApp();
    const { currentWallet, displayAccount } = useWallet();
    const [copied, setCopied] = useState(false);
    const { vaults } = useVaults();

    const copy = () => {
        setCopied(true);
        copyToClipboard(currentWallet, () => setCopied(false));
    };

    return (
        <div className={`dashboard_top_bg ${lightMode && "dashboard_top_bg--light"}`} id="dashboard">
            <div className={`dashboard_header ${lightMode && "dashboard_header--light"}`}>
                <Jazzicon diameter={100} seed={jsNumberForAddress(currentWallet)} />

                <div className={`dashboard_middle`}>
                    <div>
                        <div
                            className={`dashboard_address_header ${lightMode && "dashboard_address_header--light"}`}
                            onClick={copy}
                        >
                            <p
                                className={`dashboard_address ${lightMode && "dashboard_address--light"}`}
                                style={{ marginRight: "10px" }}
                            >
                                {displayAccount}
                            </p>
                            {!copied ? <FiCopy /> : <BsCheckCircle />}
                        </div>

                        {currentWallet ? (
                            <div
                                className={`dashboard_copy ${lightMode && "dashboard_copy--light"}`}
                                onClick={() => window.open(`${BLOCK_EXPLORER_URL}/address/${currentWallet}`, "_blank")}
                            >
                                <p style={{ marginRight: "10px" }}>View on Arbiscan</p>
                                <FiExternalLink />
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>

            <div className={`dashboard_vaults`}>
                <p className={`dashboard_wallet_title ${lightMode && "dashboard_wallet_title--light"}`}>
                    Joined Vaults
                </p>
                <Vaults vaults={vaults} />
            </div>
        </div>
    );
}

export default Dashboard;
