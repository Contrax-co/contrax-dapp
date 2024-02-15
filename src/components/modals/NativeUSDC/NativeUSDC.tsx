import React from "react";
import { ModalLayout } from "../ModalLayout/ModalLayout";
import styles from "./NativeUSDC.module.scss";
import useSwapUsdcNative from "src/hooks/useSwapUsdcNative";
import { toWei } from "src/utils/common";

interface IProps {
    handleClose: Function;
    handleInitateSwap: Function;
    formattedBalance: number;
}

const NativeUSDC: React.FC<IProps> = ({ handleClose, handleInitateSwap, formattedBalance }) => {
    const [swapAmount, setSwapAmopunt] = React.useState(0);

    const handleMax = () => {
        setSwapAmopunt(formattedBalance);
    };

    const handleSubmit = () => {
        handleInitateSwap(toWei(swapAmount, 6));
        handleClose();
    };

    return (
        <ModalLayout onClose={handleClose} className={styles.borderClass}>
            <div className={styles.container}>
                <h1 className={styles.nativeHeading}>Swap Native USDC to USDC.e</h1>
                <div></div>
                <div className={styles.inputContainer}>
                    <div className={styles.inputWrapper}>
                        <input
                            type="text"
                            placeholder="Enter here"
                            required
                            value={swapAmount}
                            min={0}
                            onChange={(e) => setSwapAmopunt(Number(e.target.value))}
                        />
                    </div>
                    <button className={`custom-button ${styles.maxBtn}`} onClick={handleMax}>
                        Max
                    </button>
                </div>
                <p className={styles.para2}>
                    Contrax vaults use USDC.e Type how much you want to swap, or click max to swap it all.
                </p>
                <div className={styles.btnContainer}>
                    <button
                        className={`custom-button  ${styles.submitButton}`}
                        onClick={handleSubmit}
                        disabled={swapAmount > formattedBalance}
                    >
                        Swap
                    </button>
                </div>
            </div>
        </ModalLayout>
    );
};

export default NativeUSDC;
