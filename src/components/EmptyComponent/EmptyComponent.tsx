import { FC, ReactNode } from "react";
import useApp from "src/hooks/useApp";
import styles from "./EmptyComponent.module.scss";

interface IProps {
    children: ReactNode;
    style?: Object;
}

export const EmptyComponent: FC<IProps> = ({ children, style = {} }) => {
    const { lightMode } = useApp();
    return (
        <div className={`${styles.container} ${lightMode && styles.containerLight}`} style={style}>
            <p>{children}</p>
        </div>
    );
};
