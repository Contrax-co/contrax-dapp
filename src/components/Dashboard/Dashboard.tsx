import { useState, useEffect } from 'react';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { BsCheckCircle } from 'react-icons/bs';
import { FiExternalLink, FiCopy } from 'react-icons/fi';
import './Dashboard.css';
import Vaults from './JoinedVaults/Vaults';

var isLocalhost = false;
if (window.location.hostname === 'localhost') {
  isLocalhost = true;
}

var fetchUrl = 'https://testing.contrax.finance/api/vaults.json';
if (isLocalhost) {
  fetchUrl = 'http://localhost:3000/api/vaults.json';
}

function Dashboard({ lightMode, currentWallet }: any) {
  const [copied, setCopied] = useState(false);
  const [vaults, setVaults] = useState([]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentWallet);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  useEffect(() => {
    fetch(fetchUrl) //`http://localhost:3000/api/vaults.json` or `https://testing.contrax.finance/api/vaults.json` for when we want it done locally
      .then((response) => response.json())
      .then((data) => {
        setVaults(data);
      });
  }, []);

  return (
    <div
      className={`dashboard_top_bg ${lightMode && 'dashboard_top_bg--light'}`}
    >
      <div
        className={`dashboard_header ${lightMode && 'dashboard_header--light'}`}
      >
        <Jazzicon diameter={100} seed={jsNumberForAddress(currentWallet)} />

        <div className={`dashboard_middle`}>
          <div>
            <div
              className={`dashboard_address_header ${
                lightMode && 'dashboard_address_header--light'
              }`}
              onClick={copyToClipboard}
            >
              <p
                className={`dashboard_address ${
                  lightMode && 'dashboard_address--light'
                }`}
                style={{ marginRight: '10px' }}
              >
                {currentWallet.substring(0, 6)}...
                {currentWallet.substring(currentWallet.length - 5)}
              </p>
              {!copied ? <FiCopy /> : <BsCheckCircle />}
            </div>

            <div
              className={`dashboard_copy ${
                lightMode && 'dashboard_copy--light'
              }`}
              onClick={() =>
                window.open(
                  `https://arbiscan.io/address/${currentWallet}`,
                  '_blank'
                )
              }
            >
              <p style={{ marginRight: '10px' }}>View on Arbiscan</p>
              <FiExternalLink />
            </div>
          </div>

         
        </div>
      </div>

      <div className={`dashboard_vaults`}>
        <p
          className={`dashboard_wallet_title ${
            lightMode && 'dashboard_wallet_title--light'
          }`}
        >
          Joined Vaults
        </p>
        <Vaults
          lightMode={lightMode}
          vaults={vaults}
          currentWallet={currentWallet}
        />
      </div>
    </div>
  );
}

export default Dashboard;
