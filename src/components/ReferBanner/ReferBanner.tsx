import React from "react";
import { ReactComponent as Bg1 } from "./1.svg";
import { ReactComponent as Bg2 } from "./2.svg";
import logo from "src/assets/images/logo.png";
import logo2 from "src/assets/images/logo-4x.png";
import { Link } from "react-router-dom";

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
                <h4 className={styles.heading}>Get $5 for Buying & $5 per Friend!</h4>
                <p className={styles.para}>
                    Instantly get $5 in USDC when you buy on Contrax.
                    <br />
                    Once you do, you'll get a referral link to give them $5 and get $5 for every referral!
                </p>
            </div>

            <Link to={"/buy?tab=Wert"} className={styles.buyButtonWrapper}>
                <button className={styles.buyButton + " custom-button"}>BUY</button>
            </Link>
        </div>
    );
};

export default ReferBanner;
