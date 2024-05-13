import React, { useMemo } from "react";
import styles from "./DeprecatedWithdraw.module.scss";
import { TiWarningOutline } from "react-icons/ti";
import { customCommify } from "src/utils/common";
import { useVaults } from "src/hooks/useVaults";
import { IS_LEGACY } from "src/config/constants";

interface IProps {}

const DeprecatedWithdraw: React.FC<IProps> = () => {
    const { vaults, isLoading } = useVaults();

    const totalBalance = useMemo(() => {
        return vaults
            .filter((item) => item.isDeprecated)
            .reduce((acc, curr) => {
                return (acc += curr.userVaultBalance * curr.priceOfSingleToken);
            }, 0);
    }, [vaults]);

    return !IS_LEGACY && totalBalance > 0.1 ? (
        <div className={`outlinedContainer ${styles.container}`}>
            <div className={styles.labeledButton}>
                <div>
                    <h3 className={styles.usdcAmount}>
                        Deprecated pools: <b>${customCommify(totalBalance)}</b>
                    </h3>
                </div>
            </div>
            <div className={styles.btnContainer}>
                <button
                    className={`custom-button ${styles.bridgeButton}`}
                    onClick={() => window.open("https://legacy.contrax.finance/earn", "_blank")}
                    disabled={false}
                >
                    Withdraw
                </button>
            </div>
            <p className={styles.disclaimer}>
                <TiWarningOutline size={12} className={styles.disclaimerLogo} />
                You can withdraw funds from deprecated pools and use them again on contrax
            </p>
        </div>
    ) : null;
};

export default DeprecatedWithdraw;
