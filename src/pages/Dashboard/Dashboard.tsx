import { useState } from "react";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { BsCheckCircle } from "react-icons/bs";
import { FiExternalLink, FiCopy } from "react-icons/fi";
import "./Dashboard.css";
import Vaults from "./JoinedVaults/Vaults";
import UserTVL from "./UserTVL/UserTVL";
import useWallet from "src/hooks/useWallet";
import useApp from "src/hooks/useApp";
import { copyToClipboard } from "src/utils";
import useConstants from "src/hooks/useConstants";
import { TokenBalances } from "./TokenBalances/TokenBalances";
import { FaKey } from "react-icons/fa";
import { MdOutlineQrCode2 } from "react-icons/md";
import { ExportPrivateKey } from "src/components/modals/ExportPrivateKey/ExportPrivateKey";
import { ExportPublicKey } from "src/components/modals/ExportPublicKey/ExportPublicKey";
import SupportChatToggle from "src/components/SupportChatToggle/SupportChatToggle";
import { TbGasStation, TbGasStationOff } from "react-icons/tb";
import { useAppDispatch, useAppSelector } from "src/state";
import { toggleSponsoredGas } from "src/state/settings/settingsReducer";
import BridgeBtn from "src/components/BridgeBtn/BridgeBtn";
import ReferralLink from "src/components/ReferralLink/ReferralLink";
import ReferBanner from "src/components/ReferBanner/ReferBanner";
import { NotSignedIn } from "src/components/NotSignedIn/NotSignedIn";
import { CHAIN_ID } from "src/types/enums";
import { WrongNetwork } from "src/components/WrongNetwork/WrongNetwork";
import ReferralEarning from "./ReferralEarning/ReferralEarning";
import { TraxEarning } from "./TraxEarning/TraxEarning";
import { TraxReferralEarning } from "./TraxReferralEarning/TraxReferralEarning";
import BridgeEthBtn from "src/components/BridgeEthBtn/BridgeEthBtn";

function Dashboard() {
    const { lightMode } = useApp();
    const { sponsoredGas } = useAppSelector((state) => state.settings);
    const { currentWallet, displayAccount, signer, networkId } = useWallet();
    const [copied, setCopied] = useState(false);
    const [openPrivateKeyModal, setOpenPrivateKeyModal] = useState(false);
    const [openQrCodeModal, setOpenQrCodeModal] = useState(false);
    const { BLOCK_EXPLORER_URL } = useConstants();
    const dispatch = useAppDispatch();

    const handleGasToggle = () => {
        dispatch(toggleSponsoredGas());
    };

    const copy = () => {
        setCopied(true);
        copyToClipboard(currentWallet, () => setCopied(false));
    };

    return (
        <div className={`dashboard_top_bg ${lightMode && "dashboard_top_bg--light"}`} id="dashboard">
            <div className={`dashboard_header ${lightMode && "dashboard_header--light"}`}>
                <div className="dashboard_header_left">
                    <Jazzicon diameter={100} seed={jsNumberForAddress(currentWallet)} />

                    {currentWallet ? (
                        <>
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
                            <div
                                className={`dashboard_copy ${lightMode && "dashboard_copy--light"}`}
                                onClick={() => window.open(`${BLOCK_EXPLORER_URL}/address/${currentWallet}`, "_blank")}
                            >
                                <p style={{ marginRight: "10px" }}>View on Arbiscan</p>
                                <FiExternalLink />
                            </div>
                        </>
                    ) : (
                        <p className={`dashboard_copy ${lightMode && "dashboard_copy--light"}`}>Sign In Required</p>
                    )}
                </div>

                <div className="dashboard-key-icons" style={currentWallet ? {} : { display: "flex" }}>
                    <SupportChatToggle />
                    {signer && (
                        <>
                            <FaKey
                                color={lightMode ? "var(--color_grey)" : "#ffffff"}
                                cursor="pointer"
                                size={20}
                                onClick={() => setOpenPrivateKeyModal(true)}
                            />
                            <MdOutlineQrCode2
                                color={lightMode ? "var(--color_grey)" : "#ffffff"}
                                cursor="pointer"
                                size={23}
                                onClick={() => setOpenQrCodeModal(true)}
                            />
                            {sponsoredGas ? (
                                <TbGasStation
                                    color={lightMode ? "var(--color_grey)" : "#ffffff"}
                                    cursor="pointer"
                                    size={23}
                                    onClick={handleGasToggle}
                                />
                            ) : (
                                <TbGasStationOff
                                    color={lightMode ? "var(--color_grey)" : "#ffffff"}
                                    cursor="pointer"
                                    size={23}
                                    onClick={handleGasToggle}
                                />
                            )}
                            {openPrivateKeyModal ? <ExportPrivateKey setOpenModal={setOpenPrivateKeyModal} /> : null}
                            {openQrCodeModal ? <ExportPublicKey setOpenModal={setOpenQrCodeModal} /> : null}
                        </>
                    )}
                </div>
            </div>

            <ReferralLink />

            <div className={`dashboard_tvl_section`}>
                <UserTVL />
                <TraxEarning />
                <TraxReferralEarning />
                <ReferralEarning />
                <BridgeBtn />
                <BridgeEthBtn />
            </div>
            <ReferBanner style={{ marginLeft: 30, marginTop: 20 }}></ReferBanner>
            {currentWallet ? (
                <>
                    <div className={`dashboard_section outlinedContainer`}>
                        <TokenBalances />
                    </div>
                    {networkId === CHAIN_ID.ARBITRUM ? (
                        <div className={`dashboard_section outlinedContainer`}>
                            <p className={`dashboard_wallet_title ${lightMode && "dashboard_wallet_title--light"}`}>
                                Staked Tokens
                            </p>
                            <Vaults />
                        </div>
                    ) : (
                        <WrongNetwork />
                    )}
                </>
            ) : (
                <NotSignedIn />
            )}
        </div>
    );
}

export default Dashboard;
