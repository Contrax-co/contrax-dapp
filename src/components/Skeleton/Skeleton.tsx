import { FC } from "react";
import useApp from "src/hooks/useApp";
import styles from "./Skeleton.module.scss";

interface IProps {
    w: number;
    h: number;
    bRadius?: number;
    bg?: string;
}

export const Skeleton: FC<IProps> = ({ w, h, bg, bRadius = 5 }) => {
    const { lightMode } = useApp();
    return (
        <div
            className={styles.container}
            style={{
                width: w,
                height: h,
                background: bg || lightMode ? "#f5f6f9" : "#001428",
                borderRadius: bRadius,
            }}
        ></div>
    );
};
