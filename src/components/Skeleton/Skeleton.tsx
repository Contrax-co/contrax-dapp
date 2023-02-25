import { FC, CSSProperties } from "react";
import useApp from "src/hooks/useApp";
import styles from "./Skeleton.module.scss";

interface IProps {
    w: number | string;
    h: number | string;
    bRadius?: number;
    bg?: string;
    style?: CSSProperties;
    className?: string;
}

export const Skeleton: FC<IProps> = ({ w, h, bg, bRadius = 5, style, className }) => {
    const { lightMode } = useApp();
    return (
        <div
            className={`${styles.container} ${className}`}
            style={{
                width: w,
                height: h,
                background: bg || (lightMode ? "#f5f6f9" : "#001428"),
                borderRadius: bRadius,
                ...style,
            }}
        ></div>
    );
};
