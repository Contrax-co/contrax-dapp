import { FC, ReactNode } from "react";
import useApp from "src/hooks/useApp";
import styles from "./ModalLayout.module.scss";

interface IProps {
    onClose: Function;
    children: ReactNode;
    style?: any;
    className?: string;
}

export const ModalLayout: FC<IProps> = ({ onClose, children, style, className }) => {
    const { lightMode } = useApp();

    return (
        <div className={styles.backdrop} onClick={(e) => onClose(e)}>
            <div
                className={`${styles.container} ${lightMode && styles.container_light} ${className}`}
                onClick={(e) => e.stopPropagation()}
                style={style}
            >
                {children}
            </div>
        </div>
    );
};
