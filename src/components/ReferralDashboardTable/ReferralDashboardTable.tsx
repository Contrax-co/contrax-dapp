import { FC, useState } from "react";
import styles from "./ReferralDashboard.module.scss";
import { customCommify } from "src/utils/common";
import useConstants from "src/hooks/useConstants";
import { FiExternalLink } from "react-icons/fi";
import { BsClipboardData } from "react-icons/bs";
import { v4 as uuid } from "uuid";
import { FaArrowDown, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { ReferralStats } from "src/api/stats";

interface ReferralDashboardTableProps {
    referrals: ReferralStats[] | undefined;
}

export const ReferralDashboardTable: FC<ReferralDashboardTableProps> = ({ referrals }) => {
    const { BLOCK_EXPLORER_URL } = useConstants();
    const [sortBy, setSortBy] = useState<"tvl" | "referred" | null>(null);
    console.log("referrals =>", referrals);

    const sortBasedOnTvl = (a: ReferralStats, b: ReferralStats) => {
        return a.tvlFromReferrals - b.tvlFromReferrals;
    };

    const sortBasedOnReferred = (a: ReferralStats, b: ReferralStats) => {
        return a.referreredAddresses.length - b.referreredAddresses.length;
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.mainHeading}>Referrals Dashboard</h1>
            <table className={styles.table}>
                <thead>
                    <tr className={styles.header}>
                        <th>
                            <div className={styles.tableData + " " + styles.heading}>Position</div>
                        </th>
                        <th>
                            <div className={styles.tableData + " " + styles.heading} style={{ cursor: "initial" }}>
                                Address
                            </div>
                        </th>
                        <th>
                            <div className={styles.tableData + " " + styles.heading} onClick={() => setSortBy("tvl")}>
                                TVL from Referrals
                                {sortBy === "tvl" && (
                                    <FaArrowDown
                                        size={14}
                                        className={`${styles.transitionDelay} ${sortBy === "tvl" ? "" : styles.rotate}`}
                                    />
                                )}
                            </div>
                        </th>
                        <th>
                            <div
                                className={styles.tableData + " " + styles.heading}
                                onClick={() => setSortBy("referred")}
                            >
                                Total Referred
                                {sortBy === "referred" && (
                                    <FaArrowDown
                                        size={14}
                                        className={`${styles.transitionDelay} ${
                                            sortBy === "referred" ? "" : styles.rotate
                                        }`}
                                    />
                                )}
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {referrals && referrals.length > 0 ? (
                        referrals
                            .sort((a, b) => {
                                if (sortBy === "tvl") {
                                    return sortBasedOnTvl(a, b);
                                } else if (sortBy === "referred") {
                                    return sortBasedOnReferred(a, b);
                                } else {
                                    return 0;
                                }
                            })
                            .map((referral, i) => (
                                <tr key={uuid()} className={styles.tableRow}>
                                    <td>
                                        <div className={`${styles.tableData}${" " + styles.specificCell}`}>{i + 1}</div>
                                    </td>
                                    <td>
                                        {true ? (
                                            <div className={styles.tableData + " " + styles.addressCol}>
                                                <p className={styles.addressText + " " + styles.onlyExtraLargeScreen}>
                                                    {referral.address}
                                                </p>
                                                <p className={styles.addressText + " " + styles.onlyLargeScreen}>
                                                    {`${`${referral.address}`.substring(
                                                        0,
                                                        12
                                                    )}...${`${referral.address}`.substring(
                                                        `${referral.address}`.length - 12
                                                    )}`}{" "}
                                                    <span className={styles.tooltip}>{referral.address}</span>
                                                </p>
                                                <p className={styles.addressText + " " + styles.onlyTablet}>
                                                    {`${`${referral.address}`.substring(
                                                        0,
                                                        8
                                                    )}...${`${referral.address}`.substring(
                                                        `${referral.address}`.length - 8
                                                    )}`}{" "}
                                                    <span className={styles.tooltip}>{`${referral.address}`}</span>
                                                </p>
                                                <p className={styles.addressText + " " + styles.onlyMobile}>
                                                    {`${`${referral.address}`.substring(
                                                        0,
                                                        5
                                                    )}...${`${referral.address}`.substring(
                                                        `${referral.address}`.length - 3
                                                    )}`}{" "}
                                                    <span className={styles.tooltip}>{`${referral.address}`}</span>
                                                </p>
                                                <FiExternalLink
                                                    size={16}
                                                    className={styles.arbiscanIcon}
                                                    onClick={() =>
                                                        window.open(
                                                            `${BLOCK_EXPLORER_URL}/address/${`${referral.address}`}`,
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
                                        <div className={`${styles.tableData}${" " + styles.specificCell}`}>
                                            {customCommify(referral.tvlFromReferrals, {
                                                minimumFractionDigits: 1,
                                                showDollarSign: true,
                                            }).slice(0, -2)}
                                        </div>
                                    </td>
                                    <td>
                                        <div className={`${styles.tableData}${" " + styles.specificCell}`}>
                                            {referral.referreredAddresses.length}
                                        </div>
                                    </td>
                                </tr>
                            ))
                    ) : (
                        <tr className={styles.tableRow}>
                            <td colSpan={6}>
                                <EmptyTable />
                            </td>
                        </tr>
                    )}
                </tbody>
                <tfoot>
                    <tr className={styles.footer}>
                        <td></td>
                        <td colSpan={5}>
                            {/* <div className={styles.tableData + " " + styles.controls}>
                                {false && <FaArrowLeft className={styles.pageChangeArrow} />}
                                <p>Page 1 of 1</p>
                                {true && <FaArrowRight className={styles.pageChangeArrow} />}
                            </div> */}
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
        </div>
    );
};
