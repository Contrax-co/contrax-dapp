import { RiChatOffFill, RiChat4Fill } from "react-icons/ri";
import useApp from "src/hooks/useApp";

function SupportChatToggle() {
    const { supportChat, toggleSupportChat } = useApp();
    return supportChat ? (
        <RiChat4Fill color="#ffffff" cursor="pointer" size={30} onClick={toggleSupportChat} />
    ) : (
        <RiChatOffFill color="#ffffff" cursor="pointer" size={30} onClick={toggleSupportChat} />
    );
}

export default SupportChatToggle;
