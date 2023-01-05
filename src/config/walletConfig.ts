
import coinbaseWalletModule from '@web3-onboard/coinbase';
import enrkypt from '@web3-onboard/enkrypt';
import gnosisModule from '@web3-onboard/gnosis';
import mewWallet from '@web3-onboard/mew-wallet';
import logo from '../images/logo-4x.png';
import Onboard from '@web3-onboard/core';
import injectedModule from '@web3-onboard/injected-wallets';

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
    name: 'Contrax',
    icon: logo,
    logo: logo,
    description: 'Contrax',
    agreement: {
      version: '1.0.0',
      termsUrl: 'https://beta.contrax.finance/termsofuse.pdf',
    },
  },
});

export {onboard}
