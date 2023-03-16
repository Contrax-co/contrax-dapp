import { RiChatOffFill, RiChat4Fill } from "react-icons/ri";
import { BsChatLeftTextFill } from "react-icons/bs";
import { MdCancel } from "react-icons/md";
import useApp from "src/hooks/useApp";

function SupportChatToggle() {
    const { supportChat, toggleSupportChat } = useApp();
    return supportChat ? (
        <>
            <BsChatLeftTextFill color="#ffffff" cursor="pointer" size={30} onClick={toggleSupportChat} />
            <MdCancel className="supportChat-close" color="#61CDDF" cursor="pointer" onClick={toggleSupportChat} />
        </>
    ) : (
        <RiChatOffFill color="#ffffff" cursor="pointer" size={30} onClick={toggleSupportChat} />
    );
}

export default SupportChatToggle;
