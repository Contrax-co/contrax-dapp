import { MdOutlineDarkMode, MdOutlineLightMode, MdLightMode, MdDarkMode } from "react-icons/md";
import { RiChatOffFill, RiChatOffLine, RiChat4Fill, RiChat4Line } from "react-icons/ri";
import useApp from "src/hooks/useApp";
import "./SupportChatToggle.css";

function SupportChatToggle() {
    const { lightMode, supportChat, toggleSupportChat } = useApp();
    return (
        <div className="supportchat_toggle_container">
            {lightMode ? (
                <RiChat4Fill className={`label1 ${lightMode && "label1--light"}`} />
            ) : (
                <RiChat4Line className={`label1 ${lightMode && "label1--light"}`} />
            )}

            <div
                className={`chattoggle ${lightMode && "chattoggle--light"} ${supportChat && "chattoggle--on"} ${
                    supportChat && lightMode && "chattoggle--light--on"
                }`}
                onClick={toggleSupportChat}
            >
                <div
                    className={`chattoggle_switch ${lightMode && "chattoggle_switch--light"} ${
                        supportChat && "chattoggle_switch--on"
                    } ${supportChat && lightMode && "chattoggle_switch--light--on"}`}
                ></div>
            </div>

            {lightMode ? (
                <RiChatOffFill className={`label2 ${lightMode && "label2--light"}`} />
            ) : (
                <RiChatOffLine className={`label2 ${lightMode && "label2--light"}`} />
            )}
        </div>
    );
}

export default SupportChatToggle;
