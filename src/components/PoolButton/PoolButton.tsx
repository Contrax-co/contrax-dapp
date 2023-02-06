import React from "react";
import useApp from "src/hooks/useApp";
import "./PoolButton.css";

interface Props {
    description: string;
    active: boolean;
    variant?: number;
    onClick?: React.MouseEventHandler<HTMLDivElement>;
}

const PoolButton: React.FC<Props> = ({ description, active, variant = 1, ...props }) => {
    const { lightMode } = useApp();
    return (
        <div
            className={`pool-button-${variant} ${lightMode && "button--light"} ${
                active && `button--selected-${variant}`
            } ${active && lightMode && `button--selected--light`}`}
            onClick={props.onClick}
        >
            {description}
        </div>
    );
};

export default PoolButton;
