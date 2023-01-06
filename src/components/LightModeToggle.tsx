import { MdOutlineDarkMode, MdOutlineLightMode, MdLightMode, MdDarkMode } from "react-icons/md";
import useApp from "src/hooks/useApp";
import "./LightModeToggle.css";

function LightModeToggle() {
    const { lightMode, toggleLight } = useApp();
    return (
        <div className="darkmode_toggle_container">
            {lightMode ? (
                <MdLightMode className={`label1 ${lightMode && "label1--light"}`} />
            ) : (
                <MdOutlineLightMode className={`label1 ${lightMode && "label1--light"}`} />
            )}

            <div className={`lighttoggle ${lightMode && "lighttoggle--light"}`} onClick={toggleLight}>
                <div className={`lighttoggle_switch ${lightMode && "lighttoggle_switch--light"}`}></div>
            </div>

            {lightMode ? (
                <MdOutlineDarkMode className={`label2 ${lightMode && "label2--light"}`} />
            ) : (
                <MdDarkMode className={`label2 ${lightMode && "label2--light"}`} />
            )}
        </div>
    );
}

export default LightModeToggle;
