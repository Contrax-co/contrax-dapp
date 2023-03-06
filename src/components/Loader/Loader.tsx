import React from "react";
import useApp from "src/hooks/useApp";
import styles from "./Loader.module.scss";

const Loader = () => {
    const { lightMode } = useApp();

    return (
        <div className={styles["center-body"]}>
            <div className={`${styles["loader-circle-21"]} ${!lightMode && styles["loader-circle-21-dark"]}`}>
                <span></span>
            </div>
        </div>
    );
};

export default Loader;
