import React, { useMemo, useState } from "react";
import styles from "./ReferralDashboard.module.scss";
import { ReferralCard } from "src/components/ReferralCard/ReferralCard";
import { ReferralDashboardTable } from "src/components/ReferralDashboardTable/ReferralDashboardTable";
import { useReferralDashboard } from "src/hooks/useReferralDashboard";
import { copyToClipboard, getPositionSuffix } from "src/utils";
import useAccountData from "src/hooks/useAccountData";
import useWallet from "src/hooks/useWallet";
import { FiCopy } from "react-icons/fi";
import { BsCheckCircle } from "react-icons/bs";

const ReferralDashboard: React.FC = () => {
    const { referralLink } = useAccountData();
    const { currentWallet } = useWallet();
    const [copied, setCopied] = useState(false);
    const { data } = useReferralDashboard();
    const topThreeReferrals = useMemo(() => {
        return data?.sort((a, b) => b.tvlFromReferrals - a.tvlFromReferrals).slice(0, 3) ?? [];
    }, [data]);

    const copy = () => {
        if (referralLink) {
            setCopied(true);
            copyToClipboard(referralLink, () => setCopied(false));
        }
    };
    return (
        <div className={styles.container}>
            <h1 className={styles.mainHeading}>Intract Referral Contest! 🎉</h1>
            <h2 className={styles.subHeading}>$500 in prizes for top 3 referrers. Contest ends March 13th</h2>
            <section className={styles.paraSection}>
                <p className={styles.para}>
                    Welcome to the Intract referral contest! The most TVL brought in by the top three referrers will
                    share in 💵 $500 of USDC prizes! 💵 Not only that, you will get a copy of 10% of the xTRAX tokens
                    earned by everyone you bring in! In order to participate:
                    <ol>
                        <li>Sign in/up with your wallet.</li>
                        <li>
                            Once signed in, you will see your referral link on this page, or copy it from your
                            dashboard.
                        </li>
                        <li>
                            Anyone who uses your link to sign up for the Contrax for the first time will be counted as a
                            referral.
                        </li>
                    </ol>
                </p>
                <p className={styles.referralPara}>
                    <b>Join the competition just by sharing your referral link!</b>{" "}
                    {currentWallet && referralLink ? (
                        <div className={styles.referralLinkContainer} onClick={copy}>
                            <span className={styles.text}>{referralLink}</span>
                            {!copied ? <FiCopy className={styles.icon} /> : <BsCheckCircle className={styles.icon} />}
                        </div>
                    ) : (
                        <span className={styles.text}>Please sign in/up to see your link</span>
                    )}
                </p>
                <div className={styles.prizesSection}>
                    <strong>🏆 Prizes</strong>
                    <ul>
                        <li>1st place: $300 in USDC</li>
                        <li>2nd place: $150 in USDC</li>
                        <li>3rd place: $50 in USDC</li>
                    </ul>
                    Prizes will be announced on this page and will be claimable on Intract.io.
                </div>
                <div className={styles.rulesSection}>
                    <strong>📜 Rules</strong>
                    <ul>
                        <li>A referral only counts if the referred user also stakes in a Contrax vault.</li>
                        <li>Your ranking is determined by the collective TVL value of your referrals.</li>
                        <li>TVL lost during the contest will be subtracted from your total referred TVL.</li>
                        <li>Winners will be announced on this page on March 13th at 11 p.m. U.S. Eastern.</li>
                        <li>
                            By signing up & referring, you agree to the{" "}
                            <a href="https://beta.contrax.finance/termsofuse.pdf">terms & conditions</a>.
                        </li>
                    </ul>
                </div>
            </section>
            <br />
            <h1 className={styles.mainHeading}>🥇 Current Standings</h1>
            <br />
            <div className={styles.topRow}>
                {topThreeReferrals.length > 0 &&
                    topThreeReferrals.map((referral, i) => (
                        <ReferralCard
                            key={referral.address}
                            heading={`Currently ${getPositionSuffix(i + 1)} Place`}
                            address={referral.address}
                        />
                    ))}
            </div>
            <ReferralDashboardTable referrals={data} />
        </div>
    );
};

export default ReferralDashboard;
