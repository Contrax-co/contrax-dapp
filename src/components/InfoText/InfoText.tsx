import React, { CSSProperties } from "react";
import styles from "./InfoText.module.scss";
import useApp from "src/hooks/useApp";
import { CgInfo } from "react-icons/cg";

interface Props {
    className?: string;
    style?: CSSProperties;
    text: string;
}

const InfoText: React.FC<Props> = ({ className, style, text }) => {
    const { lightMode } = useApp();

    return (
        <div className={`${lightMode ? styles.containerLight : styles.containerDark} ${className}`} style={style}>
            <CgInfo />
            {text}
        </div>
    );
};

export default InfoText;
