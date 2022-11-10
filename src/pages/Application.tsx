import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import TopBar from '../components/Topbar/TopBar';
import './Application.css';
import Onboard from '@web3-onboard/core';
import injectedModule from '@web3-onboard/injected-wallets';
import { getUserSession, setUserSession } from '../store/localStorage';
import Logout from '../components/Logout/Logout';
import Exchange from '../components/Exchange/Exchange';
import Compound from '../components/Compound/Compound';
import CreateToken from './createToken';
import CreatePool from './createPool';
import * as ethers from 'ethers';
import Dashboard from '../components/Dashboard/Dashboard';

const ARBITRUM_MAINNET = 'https://arb1.arbitrum.io/rpc';

const injected = injectedModule();

const onboard = Onboard({
  wallets: [injected],
  chains: [
    {
      id: '0xA4B1',
      token: 'ETH',
      label: 'Arbitrum One',
      rpcUrl: ARBITRUM_MAINNET,
    },
  ],
});

function Application() {
  const [menuItem, setMenuItem] = useState('Dashboard');
  const [lightMode, setLightMode] = useState(true);

  const [currentWallet, setCurrentWallet] = useState('');
  const [networkId, setNetworkId] = useState('');

  const [logoutInfo, setLogout] = useState(false);


  useEffect(() => {
    const data = window.localStorage.getItem('lightMode');

    if(data != null) {
      setLightMode(JSON.parse(data));
    }
  }, [])

  useEffect(() => {
    chainId();
    
    window.localStorage.setItem('lightMode', JSON.stringify(lightMode)); 
    
  }, [lightMode]);


  useEffect(() => {
    const data = getUserSession();
    if (data) {
      const userInfo = JSON.parse(data);
      setCurrentWallet(userInfo.address);
      setNetworkId(userInfo.networkId);
    }
  }, []);


  const connectWallet = async () => {
    const wallets = await onboard.connectWallet();

    if (wallets) {
      const states = onboard.state.get();
      setUserSession({
        address: states.wallets[0].accounts[0].address,
        networkId: states.chains[0].id,
      });

      setCurrentWallet(states.wallets[0].accounts[0].address);
      setNetworkId(states.chains[0].id);
    }
  };
  

  const chainId = async() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send('eth_requestAccounts', []);
    const { chainId } = await provider.getNetwork();

    setNetworkId(chainId.toString(16));
    console.log(`the networkId is ${chainId}`);
  }

  const toggleLight = () => {
    setLightMode(!lightMode);
  };

  return (
    <div className={`page ${lightMode && 'page--light'}`}>
      <div className="ac_page">
        <div className="sidebar">
          <Sidebar
            lightMode={lightMode}
            menuItem={menuItem}
            setMenuItem={setMenuItem}
            onClick={toggleLight}
          />
        </div>

        <div className={`rightside ${lightMode && 'rightside--light'}`}>
          <div className="topbar">
            <TopBar
              lightMode={lightMode}
              currentWallet={currentWallet}
              connectWallet={connectWallet}
              networkId={networkId}
              logout={() => setLogout(true)}
            />
          </div>
          {menuItem === 'Dashboard' &&
            <Dashboard
              lightMode={lightMode}
              currentWallet={currentWallet}
            />}
          {menuItem === 'Farms' && (
            <Compound
              lightMode={lightMode}
              currentWallet={currentWallet}
              connectWallet={connectWallet}
            />
          )}
          {menuItem === 'Create token' && <CreateToken />}
          {menuItem === 'Create pool' && <CreatePool />}
          {menuItem === 'Exchange' && (
          <Exchange lightMode={lightMode} currentWallet={currentWallet} /> 
          )}
        </div>
      </div>

      {logoutInfo ? (
        <Logout
          setLogout={setLogout}
          lightMode={lightMode}
          currentWallet={currentWallet}
          setCurrentWallet={setCurrentWallet}
        />
      ) : null}
    </div>
  );
}

export default Application;
