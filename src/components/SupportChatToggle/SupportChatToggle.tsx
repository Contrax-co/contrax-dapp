import { RiChatOffFill, RiChat4Fill } from "react-icons/ri";
import { BsChatLeftTextFill } from "react-icons/bs";
import useApp from "src/hooks/useApp";

function SupportChatToggle() {
    const { lightMode, supportChat, toggleSupportChat } = useApp();
    return supportChat ? (
        <BsChatLeftTextFill
            color={lightMode ? "var(--color_grey)" : "#ffffff"}
            cursor="pointer"
            size={20}
            onClick={toggleSupportChat}
        />
    ) : (
        <RiChatOffFill
            color={lightMode ? "var(--color_grey)" : "#ffffff"}
            cursor="pointer"
            size={20}
            onClick={toggleSupportChat}
        />
    );
}

export default SupportChatToggle;
