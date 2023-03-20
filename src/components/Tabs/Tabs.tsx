import { FC, ReactNode } from "react";
import "./Tabs.css";

interface Props {
    children: ReactNode;
    style?: any;
}

export const Tabs: FC<Props> = ({ children, style }) => {
    return (
        <div className="tabs" style={style}>
            {children}
        </div>
    );
};
