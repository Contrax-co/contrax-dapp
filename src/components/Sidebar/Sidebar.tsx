import SidebarItem from './SidebarItem';
import { MdSpaceDashboard } from 'react-icons/md';
import { GiFarmTractor, GiToken } from 'react-icons/gi';
import { HiDocumentText } from 'react-icons/hi';
import { AiOutlineExport } from 'react-icons/ai';
import { FaExchangeAlt } from 'react-icons/fa';
import logo from '../../images/logo.png';
import logo2 from '../../images/logo-4x.png';
import LightModeToggle from '../LightModeToggle';
import './Sidebar.css';

function Sidebar({ lightMode, menuItem, setMenuItem, ...props }: any) {
  return (
    <div className={`sidebar_bg ${lightMode && 'sidebar_bg--light'}`}>
      <img
        className="contrax_logo"
        alt="contrax-logo"
        src={lightMode ? logo2 : logo}
      />

      <div className="side_items">
        <SidebarItem
          title="Dashboard"
          icon={<MdSpaceDashboard />}
          onClick={() => setMenuItem('Dashboard')}
          active={menuItem === 'Dashboard'}
          lightMode={lightMode}
        />

        <SidebarItem
          title="Farms"
          icon={<GiFarmTractor />}
          onClick={() => setMenuItem('Farms')}
          active={menuItem === 'Farms'}
          lightMode={lightMode}
        />

        <SidebarItem
          title="Zap In/Trade"
          icon={<FaExchangeAlt />}
          onClick={() => setMenuItem('Exchange')}
          active={menuItem === 'Exchange'}
          lightMode={lightMode}
        />

        <SidebarItem
          title="Create token"
          icon={<GiToken />}
          onClick={() => setMenuItem('Create token')}
          active={menuItem === 'Create token'}
          lightMode={lightMode}
        />

        <SidebarItem
          title="Create pool"
          icon={<GiToken />}
          onClick={() => setMenuItem('Create pool')}
          active={menuItem === 'Create pool'}
          lightMode={lightMode}
        />

        <SidebarItem
          title="Docs"
          onClick={() =>
            window.open('https://contrax.gitbook.io/contrax-docs/', '_blank')
          }
          icon={<HiDocumentText />}
          icon2={<AiOutlineExport />}
          active={menuItem === 'Docs'}
          lightMode={lightMode}
        />
      </div>

      <div className="toggle_placement">
        <LightModeToggle onClick={props.onClick} lightMode={lightMode} />
      </div>
    </div>
  );
}

export default Sidebar;
