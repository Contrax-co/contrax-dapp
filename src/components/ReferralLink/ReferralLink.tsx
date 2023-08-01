import React, { useState } from "react";
import useAccountData from "src/hooks/useAccountData";
import { copyToClipboard } from "src/utils";
import useWallet from "src/hooks/useWallet";
import { FiCopy } from "react-icons/fi";
import { BsCheckCircle } from "react-icons/bs";

import styles from "./ReferralLink.module.scss";

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
                <p className={styles.heading}>Referal Link:</p>
                <p className={styles.heading2}>Ref:</p>
                <p className={styles.link} onClick={copy}>
                    <span className={styles.text}>{referralLink}</span>
                    {!copied ? <FiCopy className={styles.icon} /> : <BsCheckCircle className={styles.icon} />}
                </p>
            </div>
        );
    else return <div></div>;
};

export default ReferralLink;
