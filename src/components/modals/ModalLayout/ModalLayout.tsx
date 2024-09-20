import { FC, HTMLAttributes, ReactNode } from "react";
import useApp from "src/hooks/useApp";
import styles from "./ModalLayout.module.scss";

interface IProps extends React.HTMLAttributes<HTMLDivElement> {
    onClose: Function;
    children: ReactNode;
}

export const ModalLayout: FC<IProps> = ({ onClose, children, style, className, ...rest }) => {
    const { lightMode } = useApp();

    return (
        <div className={styles.backdrop} onClick={(e) => onClose(e)} {...rest}>
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
