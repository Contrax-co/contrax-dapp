import { useEffect, useState } from "react";
import { HiChevronDown } from "react-icons/hi";
import { priceToken } from "../../Compound/compound-item/compound-functions";
import { estimateValueTo } from "./from-functions";
import { totalFrom } from "./from-functions";
import "./From.css";

function From({
    tokenType1,
    tokenType2,
    lightMode,
    setOpenModal,
    tokens,
    tokenId,
    currentWallet,
    setValue,
    setTokenType,
    setFromAddress,
    setAbi,
    fromAddress,
    toAddress,
    setToValue,
    setFromName,
    setFromImg,
    setFromAlt,
    toName,
    setUserAmt,
    toDecimals,
    setFromDecimals,
}: any) {
    const token = tokens.slice(tokenId - 1, tokenId);

    const [tokenName, setTokenName] = useState("");
    const [tokenSrc, setTokenSrc] = useState("");
    const [tokenAlt, setTokenAlt] = useState("");
    const [tokenLp, setTokenLp] = useState("");

    const [fromAmt, setFromAmt] = useState(0);
    const [tokenAbi, setTokenAbi] = useState([]);
    const [decimals, setDecimals] = useState(0);

    const [swapAmount, setSwapAmount] = useState(0.0);

    const [fromPrice, setFromPrice] = useState(0);
    const [toPrice, setToPrice] = useState(0);

    useEffect(() => {
        token.forEach((token: any) => {
            setTokenName(token.token_name);
            setFromName(token.token_name);
            setTokenSrc(token.token_logo);
            setFromImg(token.token_logo);
            setTokenAlt(token.token_alt);
            setFromAlt(token.token_alt);
            setTokenAbi(token.token_abi);
            setTokenLp(token.address);
            setTokenType(token.token_sub);
            setFromAddress(token.address);
            setDecimals(token.decimals);
            setFromDecimals(token.decimals);
            setAbi(JSON.stringify(token.token_abi));
        });

        totalFrom(currentWallet, tokenName, setFromAmt, tokenLp, tokenAbi, setUserAmt, decimals);
    }, [
        currentWallet,
        tokenName,
        tokenLp,
        tokenAbi,
        token,
        setFromAddress,
        setTokenType,
        setAbi,
        setFromAlt,
        setFromImg,
        setFromName,
        setUserAmt,
        decimals,
        setFromDecimals,
    ]);

    useEffect(() => {
        priceToken(fromAddress, setFromPrice);
        priceToken(toAddress, setToPrice);
        estimateValueTo(
            swapAmount,
            fromPrice,
            toPrice,
            tokenType1,
            tokenType2,
            tokenName,
            toName,
            swapAmount,
            fromAddress,
            toAddress,
            setToValue,
            decimals,
            toDecimals
        );
    }, [
        fromAmt,
        tokenType1,
        tokenType2,
        fromPrice,
        toPrice,
        tokenName,
        toName,
        swapAmount,
        fromAddress,
        toAddress,
        setToValue,
        decimals,
        toDecimals,
    ]);

    const handleSwapChange = (e: any) => {
        setSwapAmount(e.target.value);
        setValue(e.target.value);
    };

    function setMax() {
        setSwapAmount((fromAmt * 999) / 1000);
        setValue((fromAmt * 999) / 1000);
    }

    return (
        <div>
            <div className="from_div">
                <p>From</p>
                <div className={`from_values`}>
                    <p className={`from_usd ${lightMode && "from_usd--light"}`}>
                        {(fromPrice * fromAmt).toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                        })}
                    </p>

                    {fromPrice * fromAmt < 0.01 ? (
                        <p className={`swap_amount ${lightMode && "swap_amount--light"}`}>0</p>
                    ) : (
                        <p className={`swap_amount ${lightMode && "swap_amount--light"}`}>{fromAmt.toFixed(15)}</p>
                    )}
                </div>
            </div>

            <div className={`from__input ${lightMode && "from__input--light"}`}>
                <input
                    type="number"
                    placeholder="0.0"
                    className={`from__amount ${lightMode && "from__amount--light"}`}
                    value={swapAmount}
                    onChange={handleSwapChange}
                />
                <p className={`swap_max ${lightMode && "swap_max--light"}`} onClick={setMax}>
                    max
                </p>

                <div
                    className={`dropdown__from ${lightMode && "dropdown__from--light"}`}
                    onClick={() => setOpenModal(true)}
                >
                    <img className={`swap__logo`} alt={tokenAlt} src={tokenSrc} />

                    <p>{tokenName}</p>
                    <HiChevronDown />
                </div>
            </div>
        </div>
    );
}

export default From;
