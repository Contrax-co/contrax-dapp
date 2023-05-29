import { FC } from "react";
import styles from "./StatsTable.module.scss";
import { useStats } from "src/hooks/useStats";
import { customCommify } from "src/utils/common";
import useConstants from "src/hooks/useConstants";
import useWallet from "src/hooks/useWallet";
import { FiExternalLink } from "react-icons/fi";

export const StatsTable: FC = () => {
    const { userTVLs, page, setPage } = useStats();
    const { BLOCK_EXPLORER_URL } = useConstants();
    const { currentWallet } = useWallet();

    return (
        <table className={styles.table}>
            <thead className={styles.tableHeader}>
                <tr className={styles.tableRow}>
                    <td className={styles.tableData}>ADDRESS</td>
                    <td className={styles.tableData}>VALUE</td>
                </tr>
            </thead>
            <tbody className={styles.tableBody}>
                {userTVLs && userTVLs.length > 0 ? (
                    userTVLs.map(({ id, tvl }) => (
                        <tr key={id} className={styles.tableRow}>
                            <td className={styles.tableData + " " + styles.addressCol}>
                                <p className={styles.addressText}>{id}</p>
                                <FiExternalLink
                                    size={16}
                                    className={styles.arbiscanIcon}
                                    onClick={() =>
                                        window.open(`${BLOCK_EXPLORER_URL}/address/${currentWallet}`, "_blank")
                                    }
                                />
                            </td>
                            <td className={styles.tableData}>
                                {customCommify(tvl, { minimumFractionDigits: 1, showDollarSign: true }).slice(0, -2)}
                            </td>
                        </tr>
                    ))
                ) : (
                    <EmptyTable />
                )}
            </tbody>
            <tfoot className={styles.tableFooter}>
                <tr className={styles.tableRow}>
                    <td className={styles.tableData}></td>
                    <td className={styles.tableData + " " + styles.controls}>
                        {page > 1 && <p onClick={() => setPage((prev) => prev - 1)}>{`< Prev`}</p>}
                        {userTVLs && userTVLs.length > 0 && (
                            <p onClick={() => setPage((prev) => prev + 1)}>{`Next >`}</p>
                        )}
                    </td>
                </tr>
            </tfoot>
        </table>
    );
};

const EmptyTable = () => {
    return <div>EmptyTable</div>;
};
