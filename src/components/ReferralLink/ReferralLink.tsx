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
            <div className="dashboard_referal_container outlinedContainer">
                <p>Referal Link:</p>
                <p className="dashboard_referal_link" onClick={copy}>
                    {referralLink}
                    {!copied ? (
                        <FiCopy className="dashboard_referal_icon" />
                    ) : (
                        <BsCheckCircle className="dashboard_referal_icon" />
                    )}
                </p>
            </div>
        );
    else return <div></div>;
};

export default ReferralLink;
