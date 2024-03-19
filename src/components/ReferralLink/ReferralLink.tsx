import React, { useState } from "react";
import useAccountData from "src/hooks/useAccountData";
import { copyToClipboard } from "src/utils";
import useWallet from "src/hooks/useWallet";

import styles from "./ReferralLink.module.scss";
// import { BsCheckCircle } from "react-icons/bs";
// import { FiCopy } from "react-icons/fi";

interface IProps {}

const ReferralLink: React.FC<IProps> = () => {
    const { referralLink } = useAccountData();
    const { currentWallet } = useWallet();
    const [copied, setCopied] = useState(false);

    const copy = () => {
        if (referralLink) {
            setCopied(true);
            copyToClipboard(referralLink, () => setCopied(false));
        }
    };

    if (currentWallet && referralLink)
        return (
            <div className={`outlinedContainer ${styles.container}`}>
                <p className={styles.heading}>Referral Link:</p>
                <p className={styles.heading2}>Share your referral link with friends to earn more xTRAX</p>
                <div className={styles.linkContainer}>
                    <p className={styles.text}>{referralLink}</p>
                    <button onClick={copy} className={`custom-button ${styles.copyBtn}`}>
                        {!copied ? "Copy" : "Copied"}
                    </button>
                </div>
            </div>
        );
    else return <div style={{ marginLeft: 18 }}></div>;
};

export default ReferralLink;
