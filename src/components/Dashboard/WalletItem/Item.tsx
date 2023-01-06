import { useState, useEffect } from "react";
import { priceOfToken, tokenInfo } from "./wallet-functions";
import "./Item.css";
import useApp from "src/hooks/useApp";

function Item({ token }: any) {
    const { lightMode } = useApp();
    const [balance, setBalance] = useState(0);
    const [name, setName] = useState("");
    const [symbol, setSymbol] = useState("");

    const [price, setPrice] = useState(0);

    useEffect(() => {
        tokenInfo(token, setBalance, setName, setSymbol);
        priceOfToken(token.contractAddress, setPrice);
    }, [token]);

    return (
        <div className={`item_container ${lightMode && "item_container--light"}`}>
            <p className={`dashboard_wallet_item_name`}>{name}</p>
            {price === 0 ? (
                <p>
                    {balance} {symbol}
                </p>
            ) : (
                <p>
                    {(balance * price).toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                    })}
                </p>
            )}
        </div>
    );
}

export default Item;
