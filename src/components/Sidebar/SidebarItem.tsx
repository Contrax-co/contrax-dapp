import useApp from "src/hooks/useApp";
import "./SidebarItem.css";

function SidebarItem({ icon, title, icon2, active, ...props }: any) {
    const { lightMode } = useApp();
    return (
        <div
            className={`sideitems 
                ${lightMode && "sideitems--light"} 
                ${active && "sideitems--selected"}`}
            onClick={props.onClick}
        >
            {icon}
            <p className="sidebar_title">{title}</p>
            {icon2}
        </div>
    );
}

export default SidebarItem;
