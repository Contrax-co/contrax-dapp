import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import './TopBar.css';

function TopBar({
  lightMode,
  currentWallet,
  connectWallet,
  logout,
  networkId,
  ...props
}: any) {
  return (
    <div className="topbar_placement">
      {currentWallet ? (
        <div
          className={`wallet_address ${lightMode && 'wallet_address--light'}`}
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
