import React from "react";
import styles from "./SwapUSDCBtn.module.scss";
import { TiWarningOutline } from "react-icons/ti";
import { customCommify } from "src/utils/common";
import useSwapUsdcNative from "src/hooks/useSwapUsdcNative";

interface IProps {
    showDisclaimer?: boolean;
}

const SwapUSDCBtn: React.FC<IProps> = ({ showDisclaimer }) => {
    const { formattedBalance, initateSwap, loading } = useSwapUsdcNative();

    return formattedBalance > 0.1 ? (
        <div className={`outlinedContainer ${styles.container}`}>
            <div className={styles.labeledButton}>
                <div>
                    <h3 className={styles.usdcAmount}>
                        Native USDC: <b>${customCommify(formattedBalance)}</b>
                    </h3>
                </div>
            </div>
            <button
                className={`custom-button ${styles.bridgeButton}`}
                type="submit"
                disabled={loading}
                onClick={initateSwap}
            >
                {loading ? "Swapping..." : "Swap to USDC"}
            </button>
            <p className={styles.disclaimer}>
                <TiWarningOutline size={12} className={styles.disclaimerLogo} />
                This will swap your entire Native USDC balance over to USDC.
            </p>
        </div>
    ) : null;
};

export default SwapUSDCBtn;
