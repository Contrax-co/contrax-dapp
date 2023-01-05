import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import TopBar from "../components/Topbar/TopBar";
import "./Application.css";
import { getUserSession, setUserSession } from "../store/localStorage";
import Logout from "../components/Logout/Logout";
import Exchange from "../components/Exchange/Exchange";
import Compound from "../components/Compound/Compound";
import CreateToken from "./tokenBuilder/createToken";
import CreatePool from "./poolBuilder/createPool";
import Dashboard from "../components/Dashboard/Dashboard";

function Application() {
  const [menuItem, setMenuItem] = useState(() => {
    const data = window.sessionStorage.getItem("menuItem");
    if (data != null) {
      return JSON.parse(data);
    } else {
      return "Farms";
    }
  });
  const [lightMode, setLightMode] = useState(() => {
    const data = window.sessionStorage.getItem("lightMode");
    if (data != null) {
      return JSON.parse(data);
    } else {
      return false;
    }
  });

  const [logoutInfo, setLogout] = useState(false);

  useEffect(() => {
    window.sessionStorage.setItem("lightMode", JSON.stringify(lightMode));
    window.sessionStorage.setItem("menuItem", JSON.stringify(menuItem));
  }, [lightMode, menuItem]);

  const toggleLight = () => {
    setLightMode(!lightMode);
  };
  return (
    <div className={`page ${lightMode && "page--light"}`}>
      <div className="ac_page">
        <div className="sidebar">
          <Sidebar lightMode={lightMode} menuItem={menuItem} setMenuItem={setMenuItem} onClick={toggleLight} />
        </div>

        <div className={`rightside ${lightMode && "rightside--light"}`}>
          <div className="topbar">
            <TopBar
              lightMode={lightMode}
              logout={() => setLogout(true)}
              setMenuItem={setMenuItem}
              onClick={toggleLight}
            />
          </div>

          {menuItem === "Dashboard" && <Dashboard lightMode={lightMode} />}
          {menuItem === "Farms" && <Compound lightMode={lightMode} />}
          {menuItem === "Create token" && <CreateToken lightMode={lightMode} />}
          {menuItem === "Create pool" && <CreatePool lightMode={lightMode} />}
          {menuItem === "Exchange" && <Exchange lightMode={lightMode} />}
        </div>
      </div>

      {logoutInfo ? <Logout setLogout={setLogout} lightMode={lightMode} /> : null}
    </div>
  );
}

export default Application;
