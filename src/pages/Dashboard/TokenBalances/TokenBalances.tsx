import { ethers } from "ethers";
import { FC, useCallback, useMemo, useState, Fragment } from "react";
import useApp from "src/hooks/useApp";
import { UIStateEnum, useTokens } from "src/hooks/useTokens";
import styles from "./TokenBalances.module.scss";
import { EmptyComponent } from "src/components/EmptyComponent/EmptyComponent";
import { TransferToken } from "src/components/modals/TransferToken/TransferToken";
import { Token } from "src/types";
import { Skeleton } from "src/components/Skeleton/Skeleton";
import { SupportedChains } from "src/config/walletConfig";
import { BiSliderAlt } from "react-icons/bi";
import { TbListDetails } from "react-icons/tb";
import OutsideClickHandler from "react-outside-click-handler";
import { useAppDispatch, useAppSelector } from "src/state";
import { toggleTokenDetailBalances } from "src/state/settings/settingsReducer";
import { getCombinedBalance } from "src/utils/common";
import useBalances from "src/hooks/useBalances";
import usePriceOfTokens from "src/hooks/usePriceOfTokens";
import { CHAIN_ID } from "src/types/enums";
import { zeroAddress } from "viem";

interface IProps {}

export const TokenBalances: FC<IProps> = () => {
    const { lightMode } = useApp();
    const { tokens, lpTokens, UIState } = useTokens();
    const [selectedToken, setSelectedToken] = useState<Token>();
    const showTokenDetailedBalances = useAppSelector((state) => state.settings.showTokenDetailedBalances);
    const { balances } = useBalances();
    const { prices } = usePriceOfTokens();

    const handleCloseModal = useCallback(() => setSelectedToken(undefined), [setSelectedToken]);
    const usdcBalance = useMemo(() => getCombinedBalance(balances, CHAIN_ID.ARBITRUM, "usdc"), [balances]);
    const ethBalance = useMemo(() => getCombinedBalance(balances, CHAIN_ID.ARBITRUM, "native"), [balances]);

    const filteredTokens = useMemo(() => {
        return tokens.filter((item) => {
            if (Number(item.usdBalance) < 0.01) return false;
            if (!showTokenDetailedBalances)
                switch (item.name) {
                    case "USDC":
                        return false;
                    case "ETH":
                        return false;
                    default:
                        return true;
                }
            else return true;
        });
    }, [tokens, showTokenDetailedBalances]);

    return (
        <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <p className={`dashboard_wallet_title ${lightMode && "dashboard_wallet_title--light"}`}>
                    Token Balances
                </p>
                <Settings />
            </div>
            {UIState === UIStateEnum.CONNECT_WALLET && (
                <EmptyComponent style={{ paddingTop: 50, paddingBottom: 50 }}>
                    Connect your wallet to view your balances
                </EmptyComponent>
            )}
            {UIState === UIStateEnum.LOADING && (
                <Skeleton w={"100%"} h={150} bg={lightMode ? "#ffffff" : undefined} bRadius={20} inverted={true} />
            )}
            {UIState === UIStateEnum.NO_TOKENS && (
                <EmptyComponent
                    link="/buy?tab=Wert"
                    linkText="Click Here to get USDC to stake"
                    style={{ width: "100%", padding: "40px 0px" }}
                >
                    {"You need USDC or ETH to enter the farms."}
                </EmptyComponent>
            )}

            {(UIState === UIStateEnum.SHOW_TOKENS_TOKENS || UIState === UIStateEnum.SHOW_TOKENS) && (
                <div className={styles.container}>
                    {!showTokenDetailedBalances && (
                        <>
                            <div
                                className={`${styles.tokenCardBase} ${lightMode && styles.tokenCardLight}`}
                                // onClick={() => setSelectedToken(tokens.find((item) => item.name === "USDC"))}
                            >
                                <img
                                    className={styles.tokenLogo}
                                    src={
                                        "https://raw.githubusercontent.com/Contrax-co/tokens/main/arbitrum-tokens/0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8/logo.png"
                                    }
                                    alt="logo"
                                />
                                <div>
                                    <p className={styles.name}>{"USDC"}</p>
                                    <p className={styles.balance}>
                                        {ethers.utils.commify(Number(usdcBalance?.formattedBalance || 0).toString())}
                                    </p>
                                </div>
                                <p className={styles.usdBalance}>
                                    {Number(usdcBalance?.formattedBalance || 0)
                                        .toLocaleString("en-US", {
                                            style: "currency",
                                            currency: "USD",
                                            minimumFractionDigits: 3,
                                        })
                                        .slice(0, -1)}
                                </p>
                            </div>
                            <div
                                className={`${styles.tokenCardBase} ${lightMode && styles.tokenCardLight}`}
                                // onClick={() => setSelectedToken(tokens.find((item) => item.name === "USDC"))}
                            >
                                <img
                                    className={styles.tokenLogo}
                                    src={
                                        "https://raw.githubusercontent.com/Contrax-co/tokens/main/arbitrum-tokens/0x82aF49447D8a07e3bd95BD0d56f35241523fBab1/logo.png"
                                    }
                                    alt="logo"
                                />
                                <div>
                                    <p className={styles.name}>{"ETH"}</p>
                                    <p className={styles.balance}>
                                        {ethers.utils.commify(Number(ethBalance?.formattedBalance || 0).toString())}
                                    </p>
                                </div>
                                <p className={styles.usdBalance}>
                                    {(
                                        Number(ethBalance?.formattedBalance || 0) *
                                        prices[CHAIN_ID.ARBITRUM][zeroAddress]
                                    )
                                        .toLocaleString("en-US", {
                                            style: "currency",
                                            currency: "USD",
                                            minimumFractionDigits: 3,
                                        })
                                        .slice(0, -1)}
                                </p>
                            </div>
                        </>
                    )}
                    {filteredTokens.map((token, i) => (
                        <div
                            key={i}
                            className={`${styles.tokenCard} ${lightMode && styles.tokenCardLight}`}
                            onClick={() => setSelectedToken(token)}
                        >
                            <img className={styles.tokenLogo} src={token.logo} alt="logo" />
                            <img
                                className={styles.networkLogo}
                                src={`https://github.com/Contrax-co/tokens/blob/main/chains/${token.networkId}.png?raw=true`}
                                alt={token.networkId.toString()}
                            />
                            <div>
                                <p className={styles.name}>
                                    {token.name}
                                    {showTokenDetailedBalances && (
                                        <span className={styles.networkName}>
                                            ({SupportedChains.find((item) => item.id === token.networkId)?.name})
                                        </span>
                                    )}
                                </p>
                                <p className={styles.balance}>
                                    {ethers.utils.commify(Number(token.balance).toString())}
                                </p>
                            </div>
                            <p className={styles.usdBalance}>
                                {token.name !== "xTrax" &&
                                    Number(token.usdBalance)
                                        .toLocaleString("en-US", {
                                            style: "currency",
                                            currency: "USD",
                                            minimumFractionDigits: 3,
                                        })
                                        .slice(0, -1)}
                            </p>
                        </div>
                    ))}
                    {selectedToken ? <TransferToken token={selectedToken} handleClose={handleCloseModal} /> : null}
                </div>
            )}
            {(UIState === UIStateEnum.SHOW_TOKENS_LP || UIState === UIStateEnum.SHOW_TOKENS) && (
                <>
                    <p
                        className={`dashboard_wallet_title ${lightMode && "dashboard_wallet_title--light"}`}
                        style={{ marginTop: 20 }}
                    >
                        Dual Token Balances
                    </p>
                    <div className={styles.container}>
                        {lpTokens
                            .filter((t) => Number(t.usdBalance) > 0.01)
                            .map((token, i) => (
                                <div
                                    key={i}
                                    className={`${styles.tokenCard} ${lightMode && styles.tokenCardLight}`}
                                    onClick={() => setSelectedToken(token)}
                                >
                                    <span style={{ display: "flex" }}>
                                        <img
                                            className={styles.tokenLogo}
                                            src={token.logo}
                                            alt="logo"
                                            style={{ clipPath: "circle(50%)" }}
                                        />
                                        <img
                                            className={styles.tokenLogo2}
                                            src={token.logo2}
                                            alt="logo"
                                            style={{ clipPath: "circle(50%)" }}
                                        />
                                    </span>
                                    <div>
                                        <p className={styles.name}>
                                            {token.name}
                                            {token.network ? (
                                                <span className={styles.networkName}>({token.network})</span>
                                            ) : null}
                                        </p>
                                        <p className={styles.balance}>
                                            {/* {token.balance && parseFloat(token.balance).toLocaleString()} */}
                                            {/* {token.balance && token.balance} */}
                                            {token.balance && parseFloat(token.balance) < 1
                                                ? token.balance
                                                : ethers.utils.commify(parseFloat(token.balance).toString())}
                                        </p>
                                    </div>
                                    <p className={styles.usdBalance}>
                                        ${ethers.utils.commify(parseFloat(token.usdBalance).toString())}
                                    </p>
                                </div>
                            ))}
                    </div>
                </>
            )}
        </>
    );
};

const Settings = () => {
    const [open, setOpen] = useState(false);
    const dispatch = useAppDispatch();
    const showTokenDetailedBalances = useAppSelector((state) => state.settings.showTokenDetailedBalances);
    return (
        <OutsideClickHandler display="inline-block" onOutsideClick={() => setOpen(false)}>
            <div style={{ position: "relative" }}>
                <div className={styles.settingsButton} onClick={() => setOpen(!open)}>
                    <BiSliderAlt />
                </div>
                {open && (
                    <div className={styles.settingsDialog}>
                        <div
                            style={{
                                display: "flex",
                                cursor: "pointer",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 10,
                            }}
                            onClick={() => {
                                dispatch(toggleTokenDetailBalances(!showTokenDetailedBalances));
                            }}
                        >
                            <TbListDetails width={16} height={16} />
                            <p>{showTokenDetailedBalances ? "Hide" : "Show"} Token Distribution</p>
                        </div>
                    </div>
                )}
            </div>
        </OutsideClickHandler>
    );
};
