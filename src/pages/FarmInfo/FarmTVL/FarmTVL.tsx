import React from "react";
import useApp from "src/hooks/useApp";

import usePriceOfTokens from "src/hooks/usePriceOfTokens";
import useTotalSupplies from "src/hooks/useTotalSupplies";
import { getLpAddressForFarmsPrice } from "src/utils/common";
import styles from "./FarmTVL.module.scss";
import uuid from "react-uuid";
import useFarms from "src/hooks/farms/useFarms";
import useWallet from "src/hooks/useWallet";
import { BsClipboardData } from "react-icons/bs";
import { PoolDef } from "src/config/constants/pools_json";

export const FarmTVL: React.FC = () => {
    const { farms } = useFarms();
    const { currentWallet } = useWallet();

    return (
        <table className={styles.table}>
            {currentWallet ? (
                <>
                    <thead>
                        <tr className={styles.header}>
                            <th>
                                <div className={styles.tableData + " " + styles.heading}>Vault</div>
                            </th>
                            <th>
                                <div className={styles.tableData + " " + styles.heading} style={{ marginLeft: "5%" }}>
                                    TVL in pool
                                </div>
                            </th>
                            <th>
                                <div className={styles.tableData + " " + styles.heading} style={{ marginLeft: "5%" }}>
                                    TVL in underlying
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <>
                            {farms.map((farm) => (
                                <FarmTVLRow key={uuid()} farm={farm} />
                            ))}
                        </>
                    </tbody>
                </>
            ) : (
                <EmptyTable />
            )}
        </table>
    );
};

const FarmTVLRow: React.FC<{ farm: PoolDef }> = ({ farm }) => {
    const lpAddress = getLpAddressForFarmsPrice([farm])[0];
    const { formattedSupplies } = useTotalSupplies();

    const {
        prices: {
            [farm.chainId]: { [farm.token1]: price1, [farm.token2!]: price2, [lpAddress]: lpPrice },
        },
    } = usePriceOfTokens();
    return (
        <tr key={uuid()} className={styles.tableRow}>
            <td>
                <div className={styles.tableData + " " + styles.addressCol}>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <div>
                            {farm?.logo1 ? <img alt={farm?.alt1} src={farm?.logo1} height={20} width={20} /> : null}
                            {farm?.logo2 ? <img alt={farm?.alt2} src={farm?.logo2} height={20} width={20} /> : null}
                        </div>
                        {farm.name}
                    </div>
                </div>
            </td>
            <td>
                <div className={`${styles.tableData}${" " + styles.specificCell}`}>
                    {formattedSupplies[farm.chainId][farm.vault_addr] &&
                        (formattedSupplies[farm.chainId][farm.vault_addr]! * lpPrice).toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                            maximumFractionDigits: 0,
                        })}
                </div>
            </td>
            <td>
                <div className={`${styles.tableData}${" " + styles.specificCell}`}>
                    {formattedSupplies[farm.chainId][farm.lp_address] &&
                        (formattedSupplies[farm.chainId][farm.lp_address]! * lpPrice).toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                            maximumFractionDigits: 0,
                        })}
                </div>
            </td>
        </tr>
    );
};

const EmptyTable = () => {
    return (
        <div className={styles.emptyTable}>
            <BsClipboardData size={36} className={styles.icon} />
            <p className={styles.disclaimer}>No Data Available</p>
        </div>
    );
};
