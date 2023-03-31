import { FC } from "react";
import styles from "./DeprecatedChip.module.scss";
interface IProps {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
}
export const DeprecatedChip: FC<IProps> = ({ top, right, bottom, left }) => (
    <div className={styles.deprecatedChip} style={{ top: top, right: right, bottom: bottom, left: left }}>
        Deprecated
    </div>
);
