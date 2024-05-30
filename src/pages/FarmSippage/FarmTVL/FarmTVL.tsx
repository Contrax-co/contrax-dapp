import React from "react";
import useApp from "src/hooks/useApp";

import usePriceOfTokens from "src/hooks/usePriceOfTokens";
import useTotalSupplies from "src/hooks/useTotalSupplies";
import { getLpAddressForFarmsPrice } from "src/utils/common";
import styles from "./FarmTVL.module.scss";
import uuid from "react-uuid";
import useFarms from "src/hooks/farms/useFarms";
import { Farm } from "src/types";

export const FarmTVL: React.FC = () => {
    const { farms } = useFarms();

    return (
        <table className={styles.table}>
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
                {farms.map((farm) => (
                    <FarmTVLRow key={uuid()} farm={farm} />
                ))}
            </tbody>
        </table>
    );
};

const FarmTVLRow: React.FC<{ farm: Farm }> = ({ farm }) => {
    const lpAddress = getLpAddressForFarmsPrice([farm])[0];
    const { formattedSupplies } = useTotalSupplies();
    const { lightMode } = useApp();

    const {
        prices: { [farm.token1]: price1, [farm.token2!]: price2, [lpAddress]: lpPrice },
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
                    {formattedSupplies[farm.vault_addr] &&
                        (formattedSupplies[farm.vault_addr]! * lpPrice).toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                            maximumFractionDigits: 0,
                        })}
                </div>
            </td>
            <td>
                <div className={`${styles.tableData}${" " + styles.specificCell}`}>
                    {formattedSupplies[farm.lp_address] &&
                        (formattedSupplies[farm.lp_address]! * lpPrice).toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                            maximumFractionDigits: 0,
                        })}
                </div>
            </td>
        </tr>
    );
};
