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
import CreateToken from './tokenBuilder/createToken';
import CreatePool from './poolBuilder/createPool';
import * as ethers from 'ethers';
import logo from '../images/logo-4x.png';
import Dashboard from '../components/Dashboard/Dashboard';
import coinbaseWalletModule from '@web3-onboard/coinbase';
import enrkypt from '@web3-onboard/enkrypt';
import gnosisModule from '@web3-onboard/gnosis';
import mewWallet from '@web3-onboard/mew-wallet';

const ARBITRUM_MAINNET = 'https://arb1.arbitrum.io/rpc';

const injected = injectedModule();
const coinbaseWalletSdk = coinbaseWalletModule({ darkMode: true });
const enrkyptModule = enrkypt();
const gnosis = gnosisModule();
const mewWalletModule = mewWallet();

const onboard = Onboard({
  wallets: [
    injected,
    coinbaseWalletSdk,
    enrkyptModule,
    gnosis,
    mewWalletModule,
  ],
  chains: [
    {
      id: '0xA4B1',
      token: 'ETH',
      label: 'Arbitrum One',
      rpcUrl: ARBITRUM_MAINNET,
    },
  ],
  appMetadata: {
    name: 'Contrax dAPP',
    icon: logo,
    logo: logo,
    description: 'Contrax dAPP',
    agreement: {
      version: '1.0.0',
      termsUrl: 'https://beta.contrax.finance/termsofuse.pdf',
    },
  },
});
function Application() {
  const [menuItem, setMenuItem] = useState(() => {
    const data = window.sessionStorage.getItem('menuItem');
    if (data != null) {
      return JSON.parse(data);
    } else {
      return 'Dashboard';
    }
  });
  const [lightMode, setLightMode] = useState(() => {
    const data = window.sessionStorage.getItem('lightMode');
    if (data != null) {
      return JSON.parse(data);
    } else {
      return false;
    }
  });

  const [currentWallet, setCurrentWallet] = useState('');
  const [networkId, setNetworkId] = useState('');

  const [logoutInfo, setLogout] = useState(false);

  useEffect(() => {
    network();

    wallet();
  });

  useEffect(() => {
    window.sessionStorage.setItem('lightMode', JSON.stringify(lightMode));
    window.sessionStorage.setItem('menuItem', JSON.stringify(menuItem));
  }, [lightMode, menuItem]);

  useEffect(() => {
    const data = getUserSession();
    if (data) {
      const userInfo = JSON.parse(data);
      setCurrentWallet(userInfo.address);
      setNetworkId(userInfo.networkId);
    }
  }, []);

  async function network() {
    const chainId = 42161;
    if (window.ethereum.networkVersion !== chainId) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xA4B1' }],
        });
      } catch (err: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (err.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainName: 'Arbitrum One',
                chainId: '0xA4B1',
                nativeCurrency: { name: 'ETH', decimals: 18, symbol: 'ETH' },
                rpcUrls: ['https://arb1.arbitrum.io/rpc/'],
              },
            ],
          });
        }
      }
    }
  }

  async function wallet() {
    const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
    let accounts = await provider.send('eth_requestAccounts', []);
    let account = accounts[0];
    provider.on('accountsChanged', function (accounts) {
      account = accounts[0];
    });

    const signer = provider.getSigner();

    const address = await signer.getAddress();

    console.log(address.toLowerCase(), currentWallet);

    const data = getUserSession();
    if (data) {
      const userInfo = JSON.parse(data);
      if (address.toLowerCase() !== userInfo.address) {
        connectWallet();
      } else {
        console.log('Sorry');
      }
    }
  }
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
              setMenuItem={setMenuItem}
              onClick={toggleLight}
            />
          </div>

          {menuItem === 'Dashboard' && (
            <Dashboard lightMode={lightMode} currentWallet={currentWallet} />
          )}
          {menuItem === 'Farms' && (
            <Compound
              lightMode={lightMode}
              currentWallet={currentWallet}
              connectWallet={connectWallet}
            />
          )}
          {menuItem === 'Create token' && <CreateToken lightMode={lightMode} />}
          {menuItem === 'Create pool' && <CreatePool lightMode={lightMode} />}
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
