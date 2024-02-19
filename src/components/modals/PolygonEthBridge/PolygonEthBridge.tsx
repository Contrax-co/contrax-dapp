import React from "react";
import { ModalLayout } from "../ModalLayout/ModalLayout";
import styles from "./PolygonEthBridge.module.scss";
import { toWei } from "src/utils/common";
import { CHAIN_ID } from "src/types/enums";
import useWallet from "src/hooks/useWallet";

interface IProps {
    handleClose: Function;
    startBridging: Function;
    formattedBalance: number;
    wrongNetwork: boolean;
}

const PolygonEthBridge: React.FC<IProps> = ({ handleClose, wrongNetwork, startBridging, formattedBalance }) => {
    const { switchNetworkAsync } = useWallet();
    const [polygonToUSDCAmount, setPolygonToUSDCAmount] = React.useState(0);

    const handleMax = () => {
        setPolygonToUSDCAmount(formattedBalance);
    };

    return (
        <ModalLayout onClose={handleClose} className={styles.borderClass}>
            <div className={styles.container}>
                <h1 className={styles.nativeHeading}>Polygon Transfer Eth to USDC.e</h1>
                <div></div>
                <div className={styles.inputContainer}>
                    <div className={styles.inputWrapper}>
                        <input
                            type="text"
                            placeholder="Enter here"
                            required
                            value={polygonToUSDCAmount}
                            min={0}
                            onChange={(e) => setPolygonToUSDCAmount(Number(e.target.value))}
                        />
                    </div>
                    <button className={`custom-button ${styles.maxBtn}`} onClick={handleMax}>
                        Max
                    </button>
                </div>
                <p className={styles.para2}>Polygon eth transfer to USDC.</p>
                <div className={styles.btnContainer}>
                    <button
                        className={`custom-button ${styles.submitButton}`}
                        onClick={
                            wrongNetwork
                                ? () => {
                                      switchNetworkAsync && switchNetworkAsync(CHAIN_ID.POLYGON);
                                  }
                                : () => {
                                      startBridging(toWei(polygonToUSDCAmount, 18));
                                      handleClose();
                                  }
                        }
                        disabled={polygonToUSDCAmount > formattedBalance}
                    >
                        Transfer
                    </button>
                </div>
            </div>
        </ModalLayout>
    );
};

export default PolygonEthBridge;
