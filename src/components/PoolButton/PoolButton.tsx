import React from "react";
import useApp from "src/hooks/useApp";
import "./PoolButton.css";

interface Props {
    description: string;
    active: boolean;
    onClick?: React.MouseEventHandler<HTMLDivElement>;
}

const PoolButton: React.FC<Props> = ({ description, active, ...props }) => {
    const { lightMode } = useApp();
    return (
        <div
            className={`pool-button ${lightMode && "button--light"} ${active && "button--selected"} ${
                active && lightMode && "button--selected--light"
            }`}
            onClick={props.onClick}
        >
            {description}
        </div>
    );
};

export default PoolButton;
