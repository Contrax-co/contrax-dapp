import './SidebarItem.css';


function SidebarItem({ icon, title, icon2, lightMode, active, ...props }: any) {
  return (
    <div
      className={`sideitems 
    ${lightMode && 'sideitems--light'} 
    ${active && 'sideitems--selected'} 
    ${active && lightMode && 'sideitems--selected--light'}`}
      onClick={props.onClick}
    >
      <div className={`icon ${lightMode && 'icon--light'}`}>{icon}</div>
      <div className="sidebar_title">{title}</div>
      <div className={`icon2 ${lightMode && 'icon2--light'}`}>{icon2}</div>
  
    </div>
  );
}

export default SidebarItem;
