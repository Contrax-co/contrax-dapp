import { useState, useEffect } from "react";
import { main } from "./wallet-functions";
import Item from "./Item";
import "./WalletItem.css";
import useApp from "src/hooks/useApp";
import useWallet from "src/hooks/useWallet";

function WalletItem() {
    const { lightMode } = useApp();
    const { currentWallet } = useWallet();
    const [tokens, setTokens] = useState([]);

    useEffect(() => {
        main(currentWallet, setTokens);
    }, [currentWallet]);

    return (
        <div className={`dashboard_wallet ${lightMode && "dashboard_wallet--light"}`}>
            {tokens.map((token: any) => (
                <Item key={token.contractAddress} token={token} lightMode={lightMode} />
            ))}
        </div>
    );
}

export default WalletItem;
