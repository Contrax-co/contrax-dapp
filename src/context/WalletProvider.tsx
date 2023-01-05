import React from "react";
import { onboard } from "../config/walletConfig";
import { getUserSession, setUserSession } from "../store/localStorage";
import * as ethers from "ethers";
import { removeUserSession } from "../store/localStorage";

export const WalletContext = React.createContext({
  currentWallet: "",
  connectWallet: () => {},
  networkId: "",
  logout: () => {},
});

interface IProps {
  children: React.ReactNode;
}

const WalletProvider: React.FC<IProps> = ({ children }) => {
  const [currentWallet, setCurrentWallet] = React.useState("");
  const [networkId, setNetworkId] = React.useState("");

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

  async function network() {
    const chainId = 42161;
    if (window.ethereum.networkVersion !== chainId) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0xA4B1" }],
        });
      } catch (err: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (err.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainName: "Arbitrum One",
                chainId: "0xA4B1",
                nativeCurrency: { name: "ETH", decimals: 18, symbol: "ETH" },
                rpcUrls: ["https://arb1.arbitrum.io/rpc/"],
              },
            ],
          });
        }
      }
    }
  }

  async function wallet() {
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    let accounts = await provider.send("eth_requestAccounts", []);
    let account = accounts[0];
    provider.on("accountsChanged", function (accounts) {
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
        console.log("Sorry");
      }
    }
  }

  async function logout() {
    removeUserSession();
    setCurrentWallet("");
  }

  React.useEffect(() => {
    const data = getUserSession();
    if (data) {
      const userInfo = JSON.parse(data);
      setCurrentWallet(userInfo.address);
      setNetworkId(userInfo.networkId);
    }
  }, []);

  React.useEffect(() => {
    network();
    wallet();
  });

  return (
    <WalletContext.Provider value={{ currentWallet, connectWallet, networkId, logout }}>
      {children}
    </WalletContext.Provider>
  );
};

export default WalletProvider;
