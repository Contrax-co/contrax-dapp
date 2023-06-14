import { useStats } from "src/hooks/useStats";
import styles from "./VaultStatsTable.module.scss";
import { FiExternalLink } from "react-icons/fi";
import useConstants from "src/hooks/useConstants";
import { customCommify } from "src/utils/common";
import { BsClipboardData } from "react-icons/bs";
export const VaultStatsTable = () => {
    const { vaultStats } = useStats();
    const { BLOCK_EXPLORER_URL } = useConstants();

    return (
        <div className={styles.container}>
            <h1>Vaults Stats</h1>
            <table className={styles.table}>
                <thead>
                    <tr className={styles.header}>
                        <th>
                            <div className={styles.tableData + " " + styles.heading}>ADDRESS</div>
                        </th>
                        <th>
                            <div className={styles.tableData + " " + styles.heading}>DEPOSITED TVL</div>
                        </th>
                        <th>
                            <div className={styles.tableData + " " + styles.heading}>AVERAGE DEPOSITS</div>
                        </th>
                        <th>
                            <div className={styles.tableData + " " + styles.heading}>NO OF DEPOSITS</div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {vaultStats && vaultStats.length > 0 ? (
                        vaultStats.map(({ _id, address, depositedTvl, averageDeposit, numberOfDeposits }) => (
                            <tr key={_id} className={styles.tableRow}>
                                <td>
                                    <div className={styles.tableData + " " + styles.addressCol}>
                                        <p className={styles.addressText + " " + styles.onlyExtraLargeScreen}>
                                            {address}
                                        </p>
                                        <p className={styles.addressText + " " + styles.onlyLargeScreen}>
                                            {`${address?.substring(0, 12)}...${address?.substring(
                                                address.length - 12
                                            )}`}{" "}
                                            <span className={styles.tooltip}>{address}</span>
                                        </p>
                                        <p className={styles.addressText + " " + styles.onlyTablet}>
                                            {`${address?.substring(0, 8)}...${address?.substring(address.length - 8)}`}{" "}
                                            <span className={styles.tooltip}>{address}</span>
                                        </p>
                                        <p className={styles.addressText + " " + styles.onlyMobile}>
                                            {`${address?.substring(0, 5)}...${address?.substring(address.length - 3)}`}{" "}
                                            <span className={styles.tooltip}>{address}</span>
                                        </p>
                                        <FiExternalLink
                                            size={16}
                                            className={styles.arbiscanIcon}
                                            onClick={() =>
                                                window.open(`${BLOCK_EXPLORER_URL}/address/${address}`, "_blank")
                                            }
                                        />
                                    </div>
                                </td>
                                <td>
                                    <div className={styles.tableData}>
                                        {customCommify(depositedTvl, {
                                            minimumFractionDigits: 1,
                                            showDollarSign: true,
                                        }).slice(0, -2)}
                                    </div>
                                </td>
                                <td>
                                    <div className={styles.tableData}>
                                        {customCommify(averageDeposit, {
                                            minimumFractionDigits: 1,
                                            showDollarSign: true,
                                        }).slice(0, -2)}
                                    </div>
                                </td>
                                <td>
                                    <div className={styles.tableData}>
                                        {customCommify(numberOfDeposits, {
                                            minimumFractionDigits: 1,
                                            showDollarSign: false,
                                        }).slice(0, -2)}
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr className={styles.tableRow}>
                            <td colSpan={4}>
                                <EmptyTable />
                            </td>
                        </tr>
                    )}
                </tbody>
                <tfoot>
                    <tr className={styles.footer}>
                        <td colSpan={4}></td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};

const EmptyTable = () => {
    return (
        <div className={styles.emptyTable}>
            <BsClipboardData size={36} className={styles.icon} />
            <p className={styles.disclaimer}>No Data Available</p>
            <p className={styles.message}>Contact the support team to report thos issue.</p>
        </div>
    );
};
