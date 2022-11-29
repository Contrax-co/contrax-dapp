import {
  MdOutlineDarkMode,
  MdOutlineLightMode,
  MdLightMode,
  MdDarkMode,
} from 'react-icons/md';
import './LightModeToggle.css';

function LightModeToggle({ lightMode, ...props }: any) {
  return (
    <div className="togglelight_container">
      {lightMode ? (
        <MdLightMode className={`label1 ${lightMode && 'label1--light'}`} />
      ) : (
        <MdOutlineLightMode
          className={`label1 ${lightMode && 'label1--light'}`}
        />
      )}

      <div
        className={`lighttoggle ${lightMode && 'lighttoggle--light'}`}
        onClick={props.onClick}
      >
        <div
          className={`lighttoggle_switch ${
            lightMode && 'lighttoggle_switch--light'
          }`}
        ></div>
      </div>

      {lightMode ? (
        <MdOutlineDarkMode
          className={`label2 ${lightMode && 'label2--light'}`}
        />
      ) : (
        <MdDarkMode className={`label2 ${lightMode && 'label2--light'}`} />
      )}
    </div>
  );
}

export default LightModeToggle;
