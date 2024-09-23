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
import ReferralLink from "src/components/ReferralLink/ReferralLink";
import ReferBanner from "src/components/ReferBanner/ReferBanner";
import { NotSignedIn } from "src/components/NotSignedIn/NotSignedIn";
import { WrongNetwork } from "src/components/WrongNetwork/WrongNetwork";
import ReferralEarning from "./ReferralEarning/ReferralEarning";
import { TraxEarning } from "./TraxEarning/TraxEarning";
import { TraxReferralEarning } from "./TraxReferralEarning/TraxReferralEarning";
import SwapUSDCBtn from "src/components/SwapUSDCBtn/SwapUSDCBtn";
import { EarnTrax } from "src/components/modals/EarnTrax/EarnTrax";
import tickIcon from "src/assets/images/tick-blue.svg";
import { useAppSelector } from "src/state";
import SuccessfulEarnTrax from "src/components/modals/SuccessfulEarnTrax/SuccessfulEarnTrax";
import { TraxApy } from "./TraxApy/TraxApy";
import { useVaults } from "src/hooks/useVaults";
import { Skeleton } from "src/components/Skeleton/Skeleton";
import DeprecatedWithdraw from "src/components/DeprecatedWithdraw/DeprecatedWithdraw";
import ArbitriumBalances from "src/components/ArbitriumBalances/ArbitriumBalances";
import BoostedApy from "src/components/BoostedApy/BoostedApy";
import OneClickMigrate from "src/components/OneClickMigrate/OneClickMigrate";
import { CHAIN_ID } from "src/types/enums";
import Transactions from "./Transactions/Transactions";

function Dashboard() {
    const { lightMode } = useApp();
    const { earnTraxTermsAgreed } = useAppSelector((state) => state.account);
    const { vaults, isFetched } = useVaults();
    const { currentWallet, displayAccount, domainName } = useWallet();
    const [congModel, setCongModel] = useState(false);
    const [copied, setCopied] = useState(false);
    const [openPrivateKeyModal, setOpenPrivateKeyModal] = useState(false);
    const [openQrCodeModal, setOpenQrCodeModal] = useState(false);
    const [openEarnTraxModal, setOpenEarnTraxModal] = useState(false);
    const { BLOCK_EXPLORER_URL } = useConstants(CHAIN_ID.ARBITRUM);

    const copy = () => {
        if (currentWallet) {
            setCopied(true);
            copyToClipboard(currentWallet, () => setCopied(false));
        }
    };

    return (
        <div className={`dashboard_top_bg ${lightMode && "dashboard_top_bg--light"}`} id="dashboard">
            <div className={`dashboard_header ${lightMode && "dashboard_header--light"}`}>
                <div className="dashboard_header_left">
                    <Jazzicon diameter={100} seed={jsNumberForAddress(currentWallet || "0x")} />

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
                                    {domainName || displayAccount}
                                </p>
                                {!copied ? (
                                    <FiCopy style={{ marginRight: 10 }} />
                                ) : (
                                    <BsCheckCircle style={{ marginRight: 10 }} />
                                )}
                                {earnTraxTermsAgreed ? (
                                    <div
                                        className={`dashboard_traxEarningEnabled animated-border--dark ${
                                            lightMode && "animated-border"
                                        }`}
                                    >
                                        <img src={tickIcon} alt="tick" className="dashboard_traxEnabledTick" />
                                        <p className="dashboard_traxEnabledTick">TRAX Earning Enabled</p>
                                    </div>
                                ) : (
                                    <button
                                        className="custom-button earn_trax_button"
                                        onClick={() => setOpenEarnTraxModal(true)}
                                    >
                                        Earn xTrax
                                    </button>
                                )}
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
                    {currentWallet && (
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
                            {openPrivateKeyModal ? <ExportPrivateKey setOpenModal={setOpenPrivateKeyModal} /> : null}
                            {openQrCodeModal ? <ExportPublicKey setOpenModal={setOpenQrCodeModal} /> : null}
                        </>
                    )}
                </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginLeft: 30 }}>
                <ReferralLink />
            </div>

            {currentWallet && !earnTraxTermsAgreed && openEarnTraxModal && (
                <EarnTrax setOpenModal={setOpenEarnTraxModal} setCongModal={setCongModel} />
            )}
            {congModel && <SuccessfulEarnTrax handleClose={() => setCongModel(false)} />}

            <div className={`dashboard_tvl_section`}>
                <UserTVL />
                <DeprecatedWithdraw />
                {/* <OneClickMigrate /> */}
                {earnTraxTermsAgreed && (
                    <>
                        <TraxEarning />
                        <TraxReferralEarning />
                        <TraxApy />
                    </>
                )}
                <ReferralEarning />
                <SwapUSDCBtn />
            </div>
            {currentWallet ? (
                <>
                    <div className={`dashboard_section outlinedContainer`} style={{ maxWidth: 500 }}>
                        <Transactions />
                    </div>
                    <div className={`dashboard_section outlinedContainer`}>
                        <TokenBalances />
                    </div>
                    <div className={`dashboard_section outlinedContainer`}>
                        {isFetched ? (
                            <>
                                {vaults.length > 0 ? (
                                    <>
                                        <p
                                            className={`dashboard_wallet_title ${
                                                lightMode && "dashboard_wallet_title--light"
                                            }`}
                                        >
                                            Staked Tokens
                                        </p>
                                        <Vaults />
                                    </>
                                ) : (
                                    <div className="dashboard_video_container">
                                        <div className="dashboard_para">
                                            <h1 className="dashboard_video_title">New to Contrax?</h1>
                                            <p className="dashboard_video_content">
                                                Watch this demo on how to get started!
                                            </p>
                                        </div>
                                        <iframe
                                            className="dashboard_iframe_video"
                                            style={{ aspectRatio: "1.7777" }}
                                            src="https://www.youtube.com/embed/cqJkiNrbVqk?si=XUyQiNVGbg99NnP1"
                                            title="YouTube video player"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            allowFullScreen
                                        ></iframe>
                                    </div>
                                )}
                            </>
                        ) : (
                            <Skeleton w={"100%"} h={250} bRadius={20} inverted={false} />
                        )}
                    </div>
                </>
            ) : (
                <NotSignedIn />
            )}
            {/* Removed banner , is reuseable*/}
            {/* <ReferBanner style={{ marginLeft: 30, marginTop: 20 }}></ReferBanner> */}
        </div>
    );
}

export default Dashboard;
