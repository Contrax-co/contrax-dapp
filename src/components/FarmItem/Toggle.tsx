import { useQuery } from "@tanstack/react-query";
import farmFunctions from "src/api/pools";
import { FARM_DATA } from "src/config/constants/query";
import useApp from "src/hooks/useApp";
import useConstants from "src/hooks/useConstants";
import useWallet from "src/hooks/useWallet";
import { Farm } from "src/types";
import "./Toggle.css";

interface Props {
    active: boolean;
    farm: Farm;
    onClick: React.MouseEventHandler<HTMLDivElement>;
}

const Toggle: React.FC<Props> = ({ active, farm, ...props }) => {
    const { lightMode } = useApp();
    const { currentWallet, provider, balanceBigNumber, multicallProvider } = useWallet();
    const { NETWORK_NAME } = useConstants();

    const { data: farmData, refetch } = useQuery(
        FARM_DATA(currentWallet, NETWORK_NAME, farm.id),
        () => farmFunctions[farm.id]?.getFarmData(multicallProvider, currentWallet, balanceBigNumber),
        {
            enabled: !!currentWallet && !!provider && !!farm,
        }
    );

    return (
        <div className="switch">
            <p
                className={`first_switch ${lightMode && "first_switch--light"} ${active && "first_switch--selected"} ${
                    active && lightMode && "first_switch--selected--light"
                }`}
            >
                Zap {farmData?.Zap_Token_Symbol}
            </p>

            <div
                onClick={props.onClick}
                className={`toggle_container ${lightMode && "toggle_container--light"} ${
                    active && "toggle_container--selected"
                } ${active && lightMode && "toggle_container--selected--light"}`}
            >
                <div
                    className={`toggle_button ${lightMode && "toggle_button--light"} ${
                        active && "toggle_button--selected"
                    } ${active && lightMode && "toggle_button--selected--light"}`}
                ></div>
            </div>

            <p
                className={`second_switch ${lightMode && "second_switch--light"} ${
                    active && "second_switch--selected"
                } ${active && lightMode && "second_switch--selected--light"}`}
            >
                {farm.name}
            </p>
        </div>
    );
};

export default Toggle;
