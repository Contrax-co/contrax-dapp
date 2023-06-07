import { FC } from "react";
import styles from "./MyReferrals.module.scss";
import { NotSignedIn } from "../NotSignedIn/NotSignedIn";
import { useMyReferrals } from "src/hooks/useMyReferrals";

export const MyReferrals: FC = () => {
    const { currentWallet, referrals } = useMyReferrals();

    return currentWallet ? (
        <div className={styles.container}>
            {referrals && (
                <>
                    <h2 style={{ margin: 0 }}>My referrals:</h2>
                    {referrals.length > 0 ? (
                        referrals?.map((add) => <div key={add}>{add}</div>)
                    ) : (
                        <p>no referrals yet</p>
                    )}
                </>
            )}
        </div>
    ) : (
        <NotSignedIn className={styles.notSignedIn} description="Sign in or sign up to see more details" />
    );
};
