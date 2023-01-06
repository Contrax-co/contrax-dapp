import useApp from "src/hooks/useApp";
import "./PoolButton.css";

function PoolButton({ description, active, ...props }: any) {
    const { lightMode } = useApp();
    return (
        <div
            className={`button ${lightMode && "button--light"} ${active && "button--selected"} ${
                active && lightMode && "button--selected--light"
            }`}
            onClick={props.onClick}
        >
            {description}
        </div>
    );
}

export default PoolButton;
