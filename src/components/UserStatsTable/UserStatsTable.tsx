import { FC } from "react";
import styles from "./UserStatsTable.module.scss";
import { useStats } from "src/hooks/useStats";
import { customCommify } from "src/utils/common";
import useConstants from "src/hooks/useConstants";
import { FiExternalLink } from "react-icons/fi";
import { BsClipboardData } from "react-icons/bs";
import { TableColumns } from "src/types/enums";
import { FaArrowDown, FaArrowLeft, FaArrowRight, FaSearch } from "react-icons/fa";

export const UserStatsTable: FC = () => {
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
        <div className={styles.container}>
            <table className={styles.table}>
                <thead>
                    <tr className={styles.header}>
                        <th>
                            <div
                                className={styles.tableData + " " + styles.heading}
                                onClick={() => handleSorting(TableColumns.Address)}
                            >
                                ADDRESS
                                {sortBy === TableColumns.Address && (
                                    <FaArrowDown
                                        size={14}
                                        className={`${styles.transitionDelay} ${order === "" ? "" : styles.rotate}`}
                                    />
                                )}
                            </div>
                        </th>
                        <th>
                            <div className={styles.tableData + " " + styles.heading} style={{ cursor: "initial" }}>
                                REFERRER
                            </div>
                        </th>
                        <th>
                            <div
                                className={styles.tableData + " " + styles.heading}
                                onClick={() => handleSorting(TableColumns.TVL)}
                            >
                                TVL
                                {sortBy === TableColumns.TVL && (
                                    <FaArrowDown
                                        size={14}
                                        className={`${styles.transitionDelay} ${order === "" ? "" : styles.rotate}`}
                                    />
                                )}
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {userTVLs && userTVLs.length > 0 ? (
                        userTVLs.map(({ id, address, tvl, accountInfo }) => (
                            <tr key={id} className={styles.tableRow}>
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
                                    {accountInfo && accountInfo.referrer ? (
                                        <div className={styles.tableData + " " + styles.addressCol}>
                                            <p className={styles.addressText + " " + styles.onlyExtraLargeScreen}>
                                                {accountInfo.referrer.address}
                                            </p>
                                            <p className={styles.addressText + " " + styles.onlyLargeScreen}>
                                                {`${accountInfo.referrer.address?.substring(
                                                    0,
                                                    12
                                                )}...${accountInfo.referrer.address?.substring(
                                                    accountInfo.referrer.address.length - 12
                                                )}`}{" "}
                                                <span className={styles.tooltip}>{address}</span>
                                            </p>
                                            <p className={styles.addressText + " " + styles.onlyTablet}>
                                                {`${accountInfo.referrer.address?.substring(
                                                    0,
                                                    8
                                                )}...${accountInfo.referrer.address?.substring(
                                                    accountInfo.referrer.address.length - 8
                                                )}`}{" "}
                                                <span className={styles.tooltip}>{accountInfo.referrer.address}</span>
                                            </p>
                                            <p className={styles.addressText + " " + styles.onlyMobile}>
                                                {`${accountInfo.referrer.address?.substring(
                                                    0,
                                                    5
                                                )}...${accountInfo.referrer.address?.substring(
                                                    accountInfo.referrer.address.length - 3
                                                )}`}{" "}
                                                <span className={styles.tooltip}>{accountInfo.referrer.address}</span>
                                            </p>
                                            <FiExternalLink
                                                size={16}
                                                className={styles.arbiscanIcon}
                                                onClick={() =>
                                                    window.open(
                                                        `${BLOCK_EXPLORER_URL}/address/${accountInfo.referrer?.address}`,
                                                        "_blank"
                                                    )
                                                }
                                            />
                                        </div>
                                    ) : (
                                        <div className={styles.tableData}>-</div>
                                    )}
                                </td>
                                <td>
                                    <div className={styles.tableData}>
                                        {customCommify(tvl, { minimumFractionDigits: 1, showDollarSign: true }).slice(
                                            0,
                                            -2
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr className={styles.tableRow}>
                            <td colSpan={3}>
                                <EmptyTable />
                            </td>
                        </tr>
                    )}
                </tbody>
                <tfoot>
                    <tr className={styles.footer}>
                        <td>
                            <div className={styles.tableData + " " + styles.searchBox}>
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
                        <td colSpan={2}>
                            <div className={styles.tableData + " " + styles.controls}>
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
                            </div>
                        </td>
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
            <p className={styles.message}>Change the filter setting to see data.</p>
        </div>
    );
};
