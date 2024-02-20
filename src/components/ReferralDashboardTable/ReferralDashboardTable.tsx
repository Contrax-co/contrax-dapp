import { FC } from "react";
import styles from "./ReferralDashboard.module.scss";
import { customCommify } from "src/utils/common";
import useConstants from "src/hooks/useConstants";
import { FiExternalLink } from "react-icons/fi";
import { BsClipboardData } from "react-icons/bs";
import { v4 as uuid } from "uuid";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

export const ReferralDashboardTable: FC = () => {
    const { BLOCK_EXPLORER_URL } = useConstants();

    return (
        <div className={styles.container}>
            <h1>Referrals Dashboard</h1>
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
                            <div className={styles.tableData + " " + styles.heading}>TVL from Referrals</div>
                        </th>
                        <th>
                            <div className={styles.tableData + " " + styles.heading}>Total Referred</div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {/* {true ? ( */}
                    {Array.from(Array(10).keys()).map((i) => (
                        <tr key={uuid()} className={styles.tableRow}>
                            <td align="center">
                                <div className={styles.tableData}>{i}</div>
                            </td>
                            <td>
                                {true ? (
                                    <div className={styles.tableData + " " + styles.addressCol}>
                                        <p className={styles.addressText + " " + styles.onlyExtraLargeScreen}>
                                            {`0x5C70387dbC7C481dbc54D6D6080A5C936a883Ba8`}
                                        </p>
                                        <p className={styles.addressText + " " + styles.onlyLargeScreen}>
                                            {`${`0x5C70387dbC7C481dbc54D6D6080A5C936a883Ba8`.substring(
                                                0,
                                                12
                                            )}...${"0x5C70387dbC7C481dbc54D6D6080A5C936a883Ba8".substring(
                                                `0x5C70387dbC7C481dbc54D6D6080A5C936a883Ba8`.length - 12
                                            )}`}{" "}
                                            <span
                                                className={styles.tooltip}
                                            >{`0x5C70387dbC7C481dbc54D6D6080A5C936a883Ba8`}</span>
                                        </p>
                                        <p className={styles.addressText + " " + styles.onlyTablet}>
                                            {`${`0x5C70387dbC7C481dbc54D6D6080A5C936a883Ba8`.substring(
                                                0,
                                                8
                                            )}...${`0x5C70387dbC7C481dbc54D6D6080A5C936a883Ba8`.substring(
                                                `0x5C70387dbC7C481dbc54D6D6080A5C936a883Ba8`.length - 8
                                            )}`}{" "}
                                            <span
                                                className={styles.tooltip}
                                            >{`0x5C70387dbC7C481dbc54D6D6080A5C936a883Ba8`}</span>
                                        </p>
                                        <p className={styles.addressText + " " + styles.onlyMobile}>
                                            {`${`0x5C70387dbC7C481dbc54D6D6080A5C936a883Ba8`.substring(
                                                0,
                                                5
                                            )}...${`0x5C70387dbC7C481dbc54D6D6080A5C936a883Ba8`.substring(
                                                `0x5C70387dbC7C481dbc54D6D6080A5C936a883Ba8`.length - 3
                                            )}`}{" "}
                                            <span
                                                className={styles.tooltip}
                                            >{`0x5C70387dbC7C481dbc54D6D6080A5C936a883Ba8`}</span>
                                        </p>
                                        <FiExternalLink
                                            size={16}
                                            className={styles.arbiscanIcon}
                                            onClick={() =>
                                                window.open(
                                                    `${BLOCK_EXPLORER_URL}/address/${`0x5C70387dbC7C481dbc54D6D6080A5C936a883Ba8`}`,
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
                                    {customCommify(3505, { minimumFractionDigits: 1, showDollarSign: true }).slice(
                                        0,
                                        -2
                                    )}
                                </div>
                            </td>
                            <td>
                                <div className={styles.tableData}>{Number(50).toLocaleString("en-us")}</div>
                            </td>
                        </tr>
                    ))}

                    {/* ) : (
                        <tr className={styles.tableRow}>
                            <td colSpan={6}>
                                <EmptyTable />
                            </td>
                        </tr>
                    )} */}
                </tbody>
                <tfoot>
                    <tr className={styles.footer}>
                        <td></td>
                        <td colSpan={5}>
                            <div className={styles.tableData + " " + styles.controls}>
                                {false && <FaArrowLeft className={styles.pageChangeArrow} />}
                                <p>Page 1 of 1</p>
                                {true && <FaArrowRight className={styles.pageChangeArrow} />}
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
        </div>
    );
};
