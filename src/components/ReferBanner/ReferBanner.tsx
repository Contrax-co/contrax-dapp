import React from "react";
import { ReactComponent as Bg1 } from "./1.svg";
import { ReactComponent as Bg2 } from "./2.svg";
import { ReactComponent as Bg } from "./bg.svg";
import logo from "src/assets/images/logo.png";
import logo2 from "src/assets/images/logo-4x.png";

import styles from "./ReferBanner.module.scss";
import useApp from "src/hooks/useApp";

interface IProps {
    style?: React.CSSProperties;
}

const ReferBanner: React.FC<IProps> = ({ style }) => {
    const { lightMode } = useApp();

    return (
        <div className={`outlinedContainer ${styles.container}`} style={style}>
            <img className={styles.logo} alt="contrax-logo" src={lightMode ? logo2 : logo} />

            <Bg2 className={styles.bg} />
            <Bg1 className={styles.bg} />
            <div className={styles.textContainer}>
                <h4 style={{ color: "white" }}>
                    Refer Your Friends
                    <br />& Earn Rewards!
                </h4>
                <p className={styles.para}>
                    Whenever you refer somebody, you both will get $5 reward.
                    <br />
                    Buy any asset from our platform, and enable your referral code to earn rewards.
                </p>
            </div>
            {/* <Bg /> */}
        </div>
    );
};

export default ReferBanner;
