import { FC, ReactNode } from "react";
import useApp from "src/hooks/useApp";
import styles from "./EmptyComponent.module.scss";
import { Link } from "react-router-dom";

interface IProps {
    children: ReactNode;
    style?: Object;
    link?: string;
    linkText?: string;
}

export const EmptyComponent: FC<IProps> = ({ children, style = {}, link = "", linkText }) => {
    const { lightMode } = useApp();
    return (
        <div className={`${styles.container} ${lightMode && styles.containerLight}`} style={style}>
            <p>
                {children} <Link to={link}>{linkText}</Link>
            </p>
        </div>
    );
};
