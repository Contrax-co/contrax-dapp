import React from "react";
import styles from "./Buy.module.scss";
import useApp from "src/hooks/useApp";
import useFront from "src/hooks/useFront";

interface IProps {}

const Front: React.FC<IProps> = () => {
    const { lightMode } = useApp();
    const { handleCreateConnection, handleTransfer, holdings, loading } = useFront();

    return (
        <div>
            <button
                onClick={handleCreateConnection}
                disabled={loading}
                className={`custom-button ${lightMode && "custom-button-light"}`}
            >
                Create Connection
            </button>

            <div>
                {holdings.map((holding) => (
                    <div key={holding.symbol} className="center" style={{ gap: 50 }}>
                        <div>{holding.symbol}</div>
                        <div>{holding.balance}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Front;
