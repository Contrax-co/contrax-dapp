import useFarmDetails from "src/hooks/farms/useFarmDetails";
import { Vault } from "src/types";
import { toFixedFloor } from "src/utils/common";
import { GoArrowUp, GoArrowDown } from "react-icons/go";
import { useAppSelector } from "src/state";
import { Skeleton } from "src/components/Skeleton/Skeleton";
import styles from "./VaultItem.module.scss";
import useTrax from "src/hooks/useTrax";
import { useMemo } from "react";

interface Props {
    vault: Vault;
}

function useOldPrice(address: string) {
    const { isLoadingEarnings } = useFarmDetails();
    const oldPrice = useAppSelector((state) => state.prices.oldPrices[address]);
    const { isFetchingOldPrices, isLoadedOldPrices } = useAppSelector((state) => state.prices);

    return { oldPrice, isLoading: (isLoadingEarnings || isFetchingOldPrices) && !isLoadedOldPrices };
}

const VaultItem: React.FC<Props> = ({ vault }) => {
    const { oldPrice, isLoading: isLoadingOldData } = useOldPrice(vault.lp_address);
    const { getTraxApy } = useTrax();
    const estimateTrax = useMemo(() => getTraxApy(vault.vault_addr), [getTraxApy, vault]);
    const {
        userVaultBalance,
        priceOfSingleToken,
        apys: { apy },
    } = vault;
    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <div className={styles.header}>
                    {vault.alt1 ? <img className={styles.logo1} alt={vault.alt1} src={vault.logo1} /> : null}

                    {vault.alt2 ? <img className={styles.logo2} alt={vault.alt2} src={vault.logo2} /> : null}

                    <p className={styles.name}>{vault.name}</p>
                </div>
                <div className={styles.properties}>
                    <div className={styles.property}>
                        <div className={styles.title}>
                            <p>Your Stake</p>
                        </div>
                        <div className={styles.value}>
                            <p>
                                {(userVaultBalance * priceOfSingleToken)
                                    .toLocaleString("en-US", {
                                        style: "currency",
                                        currency: "USD",
                                        minimumFractionDigits: 3,
                                    })
                                    .slice(0, -1)}
                            </p>
                            <div style={{ minWidth: 60 }}>
                                {isLoadingOldData && <Skeleton w={45} h={16} style={{ marginLeft: 5 }} />}
                                {!isLoadingOldData &&
                                    oldPrice &&
                                    Number(
                                        (
                                            userVaultBalance * priceOfSingleToken -
                                            userVaultBalance * oldPrice[0].price
                                        ).toFixed(2)
                                    ) !== 0 &&
                                    (oldPrice[0].price > priceOfSingleToken ? (
                                        <span
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                            }}
                                        >
                                            <GoArrowDown style={{ color: "red" }} />
                                            <p style={{ margin: 0, fontSize: 10 }}>
                                                {Math.abs(
                                                    userVaultBalance * priceOfSingleToken -
                                                        userVaultBalance * oldPrice[0].price
                                                ).toLocaleString("en-US", {
                                                    style: "currency",
                                                    currency: "USD",
                                                })}
                                            </p>
                                        </span>
                                    ) : (
                                        <span
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                            }}
                                        >
                                            <GoArrowUp style={{ color: "lime" }} />
                                            <p style={{ margin: 0, fontSize: 10 }}>
                                                {Math.abs(
                                                    userVaultBalance * oldPrice[0].price -
                                                        userVaultBalance * priceOfSingleToken
                                                ).toLocaleString("en-US", {
                                                    style: "currency",
                                                    currency: "USD",
                                                })}
                                            </p>
                                        </span>
                                    ))}
                            </div>
                        </div>
                    </div>

                    <div className={styles.property}>
                        <div className={styles.title}>
                            <p>APY</p>
                        </div>
                        <div className={styles.value}>
                            <p>
                                {toFixedFloor(apy || 0, 2) == 0
                                    ? "--"
                                    : apy < 0.01
                                    ? `${apy.toPrecision(2).slice(0, -1)}%`
                                    : `${toFixedFloor(apy, 2).toString()}%`}
                            </p>
                        </div>
                    </div>
                    {estimateTrax && estimateTrax > "0" && (
                        <div className={styles.property}>
                            <div className={styles.title}>
                                <p>xTRAX</p>
                            </div>
                            <div className={styles.value}>
                                <p>+{estimateTrax}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VaultItem;
