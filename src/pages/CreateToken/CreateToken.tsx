import { useState } from "react";
import Tokens from "./Tokens";
import LoadingSpinner from "src/components/spinner/spinner";
import "./createToken.css";
import useApp from "src/hooks/useApp";
import useCreateToken from "src/hooks/useCreateToken";
import useUserTokens from "src/hooks/useUserTokens";

export default function CreateToken() {
    const { lightMode } = useApp();
    const [tokenSymbol, setTokenSymbol] = useState("");
    const [tokenSupply, setTokenSupply] = useState("");
    const [tokenName, setTokenName] = useState("");
    const [tokenDecimal, setTokenDecimal] = useState("18");
    const [tokenBurn, setTokenBurn] = useState(false);
    const [tokenBurnValue, setTokenBurnValue] = useState("");
    const [tokenTradingFee, setTokenTradingFee] = useState(false);
    const [tokenTradingFeeValue, setTradingFeeValue] = useState("");
    const [tokenSupplyIncrease, settokenSupplyIncrease] = useState(false);
    const {refetch:refetchUserTokens} = useUserTokens()

    const { createTokenAsync, isLoading } = useCreateToken();

    const handleSubmit = async () => {
        let name = tokenName;
        let symbol = tokenSymbol;
        let decimal = Number(tokenDecimal);
        let burnPercantageIdentifier = tokenBurn;
        let initialSupply = Number(tokenSupply);
        let mintable = tokenSupplyIncrease;
        let burnPercentage = Number(tokenBurnValue);
        let transactionFeePercentage = Number(tokenTradingFeeValue);
        let transactionFeePercentageIdentiier = tokenTradingFee;

        await createTokenAsync({
            name,
            symbol,
            decimal,
            burnPercantageIdentifier,
            initialSupply,
            mintable,
            burnPercentage,
            transactionFeePercentage,
            transactionFeePercentageIdentiier,
        });

        // Refetch user tokens after creating tokens, so tokens can be updated in UI
        refetchUserTokens();
    };

    return (
        <>
            <div className="pages">
                <div className={`token-header ${lightMode && "token-header-light"}`}></div>
                <div className={`token-containers ${lightMode && "token-containers-light"}`}>
                    <h1 className="token-h1">Deploy an ERC-20 Token</h1>

                    <form>
                        <div className="token-rows">
                            <div className="token-column">
                                <label className="token-label">Token Name</label>
                                <input
                                    className={`token-inputs ${lightMode && "token-inputs-light"}`}
                                    type="text"
                                    id="name"
                                    placeholder="e.g. My Token"
                                    onChange={(e) => setTokenName(e.target.value)}
                                />
                            </div>
                            <div className="token-column">
                                <label className="token-label">Token Symbol</label>
                                <input
                                    className={`token-inputs ${lightMode && "token-inputs-light"}`}
                                    type="text"
                                    id="email"
                                    placeholder="e.g. MYT"
                                    onChange={(e) => setTokenSymbol(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="token-rows">
                            <div className="token-column">
                                <label className="token-label">Token Supply</label>
                                <input
                                    className={`token-inputs ${lightMode && "token-inputs-light"}`}
                                    type="number"
                                    id="subject"
                                    placeholder="e.g. 21000000"
                                    onChange={(e) => setTokenSupply(e.target.value)}
                                />
                            </div>
                            <div className="token-column">
                                <label className="token-label">Decimals</label>
                                <input
                                    className={`token-inputs ${lightMode && "token-inputs-light"}`}
                                    type="text"
                                    id="disabled-input"
                                    value="18"
                                    onChange={(e) => setTokenDecimal(e.target.value)}
                                />
                            </div>
                        </div>
                        <h2 className="token-header-special">Special Features</h2>
                        <div className="token-rows-special">
                            <div className="token-column-special">
                                <label className="token-special-labels">
                                    <input onChange={(e) => setTokenBurn(true)} type="checkbox" name="checkbox" />
                                    Burn
                                </label>
                                <p className="token-special-desc">
                                    Percentage of tokens will be sent to the burn address for each on-chain transfer
                                </p>
                            </div>
                            <input
                                className={`token-inputs-special ${lightMode && "token-inputs-special-light"}`}
                                type="number"
                                placeholder="0%"
                                onChange={(e) => setTokenBurnValue(e.target.value)}
                            />
                        </div>
                        <div className="token-rows-special">
                            <div className="token-column-special">
                                <label className="token-special-labels">
                                    <input onChange={(e) => setTokenTradingFee(true)} type="checkbox" name="checkbox" />
                                    Trading Fees
                                </label>
                                <p className="token-special-desc">
                                    Percentage of tokens will be sent to the creators address for each on-chain transfer
                                </p>
                            </div>
                            <input
                                className={`token-inputs-special ${lightMode && "token-inputs-special-light"}`}
                                type="number"
                                placeholder="0%"
                                onChange={(e) => setTradingFeeValue(e.target.value)}
                            />
                        </div>
                        <label className="token-special-labels">
                            <input onChange={(e) => settokenSupplyIncrease(true)} type="checkbox" name="checkbox" />
                            Supports Supply Increase
                        </label>
                        <p className="token-special-desc">
                            Allows creator to issue additional tokens after the token has been deployed
                        </p>
                    </form>
                    <div className="token-buttons">
                        {!isLoading ? (
                            <div>
                                {tokenName && tokenDecimal && tokenSupply && tokenSymbol ? (
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isLoading}
                                        type="button"
                                        className="deploy-token-btn"
                                    >
                                        Deploy Token
                                    </button>
                                ) : (
                                    <button type="button" className="deploy-token-btn-disabled">
                                        Deploy Token
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div style={{ marginLeft: "20%" }}>
                                <LoadingSpinner />
                            </div>
                        )}
                    </div>
                </div>
                <Tokens />
            </div>
        </>
    );
}
