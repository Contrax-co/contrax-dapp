// @ts-nocheck
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import swal from "sweetalert";
import { getUserSession } from "src/store/localStorage";
import Tokens from "./Tokens";
import LoadingSpinner from "src/components/spinner/spinner";
import "./createToken.css";
import useApp from "src/hooks/useApp";
import contractFile from "src/assets/abis/erc20.json";

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
    const [tokenAddress, setTokenAddress] = useState();
    const [wallet, setWallet] = useState();
    const [decimals, setDecimal] = useState();
    const [totalSupply, setTotalSupply] = useState();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        let walletData: any;
        let sessionData = getUserSession();
        if (sessionData) {
            walletData = JSON.parse(sessionData);
            setWallet(walletData.address);
        }
    }, []);

    const handleSubmit = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const { chainId } = await provider.getNetwork();

        let name = tokenName;
        let symbol = tokenSymbol;
        let decimal = Number(tokenDecimal);
        let burnPercantageIdentifier = tokenBurn === "on" ? true : false;
        let initialSupply = Number(tokenSupply);
        let mintable = tokenSupplyIncrease === "on" ? true : false;
        let burnPercentage = Number(tokenBurnValue);
        let transactionFeePercentage = Number(tokenTradingFeeValue);
        let transactionFeePercentageIdentiier = tokenTradingFee === "on" ? true : false;

        const ldecimal = 1;
        const hdecimal = 19;
        const lts = -1;
        const hts = 99999999999999999;

        if (decimal > ldecimal && decimal < hdecimal) {
            if (symbol.length < 16) {
                if (initialSupply > lts && initialSupply < hts) {
                    if (name.length < 64) {
                        setIsLoading(true);
                        const dec: any = decimal.toString();
                        setDecimal(dec);
                        const ts: any = initialSupply.toString();
                        setTotalSupply(ts);

                        const metadata = contractFile;
                        const factory = new ethers.ContractFactory(metadata.abi, metadata.bytecode, signer);

                        const contract = await factory.deploy(
                            name,
                            symbol,
                            decimal,
                            initialSupply,
                            burnPercentage,
                            burnPercantageIdentifier,
                            transactionFeePercentage,
                            transactionFeePercentageIdentiier,
                            mintable
                        );
                        contract.deployed();

                        const add = contract.address;
                        setTokenAddress(add);
                        const addd = await contract.deployTransaction.wait();

                        if (!addd.blockNumber) {
                        } else {
                            setIsLoading(false);

                            swal({
                                title: "Congratulations!",
                                text: "Your token was created successfully! Please allow a few minutes for confirmation then the token will appear in your Token Table",
                                icon: "success",
                            }).then((data) => {});
                        }
                    } else {
                        swal("Something went wrong", "Token Name must be between 1 and 64 characters");
                    }
                } else {
                    swal("Something went wrong", "Token Supply must be between 1 and 99999999999999999");
                }
            } else {
                swal("Something went wrong", "Token Name is more than 16 characters");
            }
        } else {
            swal("Something went wrong", "Decimal must be a whole number between 1 and 18");
        }
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
                                    disabled="disabled"
                                    id="disabled-input"
                                    autocomplete="false"
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
                                    <button onClick={handleSubmit} type="button" className="deploy-token-btn">
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
