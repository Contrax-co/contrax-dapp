import { FC } from "react";
import styles from "./FarmRowChip.module.scss";
interface IProps {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
    color?: "primary" | "warning";
    text: string;
    position?: "absolute" | "static" | "relative" | "fixed" | "sticky";
}
const FarmRowChip: FC<IProps> = ({ top, right, bottom, left, position, color, text }) => {
    const getColor = () => {
        let colorVar = "";
        switch (color) {
            case "primary":
                colorVar = "var(--color_primary)";
                break;
            case "warning":
                colorVar = "var(--color_warning)";
                break;
            default:
                colorVar = "var(--color_primary)";
                break;
        }
        return { colorVar };
    };
    return (
        <div
            className={styles.deprecatedChip}
            style={{
                position,
                top: top,
                right: right,
                bottom: bottom,
                left: left,
                backgroundColor: getColor().colorVar,
            }}
        >
            {text}
        </div>
    );
};

export default FarmRowChip;
