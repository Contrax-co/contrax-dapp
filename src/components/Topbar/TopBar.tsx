import { useState } from 'react';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import {TbMenu2} from "react-icons/tb";
import './TopBar.css';
import LightModeToggle from '../LightModeToggle';

function TopBar({
  lightMode,
  currentWallet,
  connectWallet,
  logout,
  networkId,
  setMenuItem,
  ...props
}: any) {

  const [show, setShow] = useState(false); 

  return (
    <div className="topbar_placement">
      <div className={`topbar_menu ${lightMode && 'topbar_menu--light'}`} onClick={() => setShow(!show)}>
       <TbMenu2 /> 
      </div>
      {
        show ? (
          <div className={`dropdown_hamburger_menu ${lightMode && 'dropdown_hamburger_menu--light'}`}>
            <a href ="#dashboard" onClick={() => {setMenuItem("Dashboard"); setShow(!show)} } ><p>Dashboard</p></a>              
            <a href = "#farms" onClick={() => {setMenuItem("Farms"); setShow(!show)}}>< p>Farms</p></a>
            <a href ="#exchange" onClick={() => {setMenuItem("Exchange"); setShow(!show) }}><p>Exchange</p></a>
            <a href ="#token" onClick={() => {setMenuItem("Create token"); setShow(!show)}}><p>Create Token</p></a>
            <a href ="#pool" onClick={() => {setMenuItem("Create pool"); setShow(!show)}}><p>Create Pool</p></a>
            <a href ="#docs" onClick={() => {
            window.open('https://contrax.gitbook.io/contrax-docs/', '_blank');
            setShow(!show)
            }
          }><p>Docs</p></a>
            <div>
              <LightModeToggle onClick={props.onClick} lightMode={lightMode}/>
            </div>
          </div>
        ) : null}

      {currentWallet ? (
        <div
          className={`connect_wallet2 ${lightMode && 'connect_wallet2--light'}`}
        >
          {networkId === '0xa4b1' || networkId === 'a4b1' ? (
            <div className={`ethBal ${lightMode && 'ethBal--light'}`}>
              <p>Arbitrum</p>
            </div>
          ) : (
            <div
              className={`wrongNetwork ${lightMode && 'wrongNetwork--light'}`}
            >
              <p>Wrong network!</p>
            </div>
          )}

          <div
            className={`connected_wallet ${
              lightMode && 'connected_wallet--light'
            }`}
            onClick={logout}
          >
            <p className="address">
              {currentWallet.substring(0, 6)}...
              {currentWallet.substring(currentWallet.length - 5)}
            </p>
            <Jazzicon diameter={30} seed={jsNumberForAddress(currentWallet)} />
          </div>
        </div>
      ) : (
        <div className={`connect_wallet`} onClick={connectWallet}>
          connect to wallet
        </div>
      )}
    </div>
  );
}

export default TopBar;
