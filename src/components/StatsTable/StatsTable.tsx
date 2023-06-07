import { FC } from "react";
import styles from "./StatsTable.module.scss";
import { useStats } from "src/hooks/useStats";
import { customCommify } from "src/utils/common";
import useConstants from "src/hooks/useConstants";
import { FiExternalLink } from "react-icons/fi";
import { BsClipboardData } from "react-icons/bs";
import { TableColumns } from "src/types/enums";
import { FaArrowDown, FaArrowLeft, FaArrowRight, FaSearch } from "react-icons/fa";

export const StatsTable: FC = () => {
    const {
        userTVLs,
        page,
        setPage,
        hasNextPage,
        hasPrevPage,
        totalPages,
        sortBy,
        setSortBy,
        order,
        setOrder,
        search,
        setSearch,
    } = useStats();
    const { BLOCK_EXPLORER_URL } = useConstants();

    const handleSorting = (column: TableColumns) => {
        if (column === sortBy) {
            if (order === "") setOrder("-");
            else setOrder("");
        } else setSortBy(column);
    };

    return (
        <table className={styles.table}>
            <thead className={styles.tableHeader}>
                <tr className={styles.tableRow}>
                    <td className={styles.tableData} onClick={() => handleSorting(TableColumns.Address)}>
                        <p className={styles.columnHeading}>
                            ADDRESS
                            {sortBy === TableColumns.Address && (
                                <FaArrowDown
                                    size={14}
                                    className={`${styles.transitionDelay} ${order === "" ? "" : styles.rotate}`}
                                />
                            )}
                        </p>
                    </td>
                    <td className={styles.tableData} onClick={() => handleSorting(TableColumns.TVL)}>
                        <p className={styles.columnHeading}>
                            VALUE
                            {sortBy === TableColumns.TVL && (
                                <FaArrowDown
                                    size={14}
                                    className={`${styles.transitionDelay} ${order === "" ? "" : styles.rotate}`}
                                />
                            )}
                        </p>
                    </td>
                </tr>
            </thead>
            <tbody className={styles.tableBody}>
                {userTVLs && userTVLs.length > 0 ? (
                    userTVLs.map(({ id, address, tvl }) => (
                        <tr key={id} className={styles.tableRow}>
                            <td className={styles.tableData + " " + styles.addressCol}>
                                <p className={styles.addressText + " " + styles.onlyExtraLargeScreen}>{address}</p>
                                <p className={styles.addressText + " " + styles.onlyLargeScreen}>
                                    {`${address?.substring(0, 12)}...${address?.substring(address.length - 12)}`}{" "}
                                    <div className={styles.tooltip}>{address}</div>
                                </p>
                                <p className={styles.addressText + " " + styles.onlyTablet}>
                                    {`${address?.substring(0, 8)}...${address?.substring(address.length - 8)}`}{" "}
                                    <div className={styles.tooltip}>{address}</div>
                                </p>
                                <p className={styles.addressText + " " + styles.onlyMobile}>
                                    {`${address?.substring(0, 6)}...${address?.substring(address.length - 4)}`}{" "}
                                    <div className={styles.tooltip}>{address}</div>
                                </p>
                                <FiExternalLink
                                    size={16}
                                    className={styles.arbiscanIcon}
                                    onClick={() => window.open(`${BLOCK_EXPLORER_URL}/address/${address}`, "_blank")}
                                />
                            </td>
                            <td className={styles.tableData}>
                                {customCommify(tvl, { minimumFractionDigits: 1, showDollarSign: true }).slice(0, -2)}
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr className={styles.tableRow}>
                        <td colSpan={2}>
                            <EmptyTable />
                        </td>
                    </tr>
                )}
            </tbody>
            <tfoot className={styles.tableFooter}>
                <tr className={styles.tableRow}>
                    <td className={styles.tableData}>
                        <div className={styles.searchBox}>
                            <FaSearch className={styles.onlyMobile} />
                            <label htmlFor="searchBox" className={styles.onlyDesktop}>
                                Search:
                            </label>
                            <input
                                id="searchBox"
                                name="searchBox"
                                type="text"
                                value={search}
                                onChange={(e) => {
                                    setPage(1);
                                    setSearch(e.target.value);
                                }}
                            />
                        </div>
                    </td>
                    <td className={styles.tableData + " " + styles.controls}>
                        {hasPrevPage && (
                            <FaArrowLeft
                                className={styles.pageChangeArrow}
                                onClick={() => setPage((prev) => prev - 1)}
                            />
                        )}
                        <p>
                            Page {page} of {totalPages}
                        </p>
                        {hasNextPage && (
                            <FaArrowRight
                                className={styles.pageChangeArrow}
                                onClick={() => setPage((prev) => prev + 1)}
                            />
                        )}
                    </td>
                </tr>
            </tfoot>
        </table>
    );
};

const EmptyTable = () => {
    return (
        <div className={styles.emptyTable}>
            <BsClipboardData size={36} className={styles.icon} />
            <p className={styles.disclaimer}>No Data Available</p>
            <p className={styles.message}>Change the filter setting to see data.</p>
        </div>
    );
};