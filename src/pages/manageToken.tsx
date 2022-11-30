import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import * as colors from '../theme/colors';
import { getUserSession } from '../store/localStorage';

import Header from '../components/header/Header';
import StatsCard from '../components/statsCard/StatsCard';
import BottomBar from '../components/bottomBar/BottomBar';
import PieChart from '../components/chart/PieChart';
import { B1, H3 } from '../components/text/Text';
import { Col, Container, Row } from '../components/blocks/Blocks';
import { FormInput } from '../components/form/Form';
import { Modal } from '../components/modal/Modal';

const contractFile = require('../config/erc20.json');
const ethers = require('ethers');

declare global {
  interface Window {
    ethereum: any;
  }
}
export default function ManageToken() {
  let location = useLocation();
  console.log(location.state);
  let chartDataList = [
    ['Title', 'Supply'],
    ['Your Tokens', 64000000],
    ['Other Tokens', 36000000],
  ];
  let any: any = {};

  const [tokenAddress, setTokenAddress] = useState(any);
  const [selectedToken, setSelectedToken] = useState(any);

  useEffect(() => {
    let walletData: any;
    let sessionData = getUserSession();
    if (sessionData) {
      walletData = JSON.parse(sessionData);
      setSelectedToken(walletData);
    }
    setTokenAddress(location.state);
    console.log(tokenAddress);
  }, []);

  const get = async (address: String) => {
    try {
      console.log(address);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      console.log(provider);
      const signer = provider.getSigner();
      console.log(signer);
      const { chainId } = await provider.getNetwork();
      console.log(chainId);
      const metadata = contractFile;
      const dummyContract = new ethers.Contract(address, metadata.abi, signer);
      console.log(dummyContract);
      const decimals = await dummyContract.decimals();
      console.log(decimals);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div>
      <Header />
      <Container className="container mb-5">
        <nav>
          <div className="nav nav-tabs" id="nav-tab" role="tablist">
            <button
              className="nav-link active"
              id="nav-home-tab"
              data-bs-toggle="tab"
              data-bs-target="#nav-home"
              type="button"
              role="tab"
              aria-controls="nav-home"
              aria-selected="true"
            >
              <B1 color={colors.primary}>Token Details</B1>
            </button>
          </div>
        </nav>
        <div className="tab-content" id="nav-tabContent">
          <div
            className="tab-pane fade show active"
            id="nav-home"
            role="tabpanel"
            aria-labelledby="nav-home-tab"
          >
            <Row className="mt-4 mb-3">
              <Col size="12">
                <H3>Coin Name: {tokenAddress.tokenName}</H3>
                <H3 color={colors.primary}></H3>
                <p>
                  <b>Token Address: </b>
                  {tokenAddress.tokenaddress}
                </p>
              </Col>
            </Row>
            <Row>
              <Col size="8" className="my-2">
                <Row className="row">
                  <Col size="6" className="my-2">
                    <StatsCard
                      cardIcon={'fas fa-project-diagram'}
                      cardTitle={'Symbol'}
                      cardValue={tokenAddress.tokenSymbol}
                    />
                  </Col>
                  <Col size="6" className="my-2">
                    <StatsCard
                      cardIcon={'fas fa-wallet'}
                      cardTitle={'Decimal'}
                      cardValue={tokenAddress.decimal}
                    />
                  </Col>
                  <Col size="6" className="my-2">
                    <StatsCard
                      cardIcon={'fas fa-chart-line'}
                      cardTitle={'Total Supply'}
                      cardValue={tokenAddress.totalSupply}
                    />
                  </Col>
                </Row>
              </Col>
              <Col size="4" className="my-2">
                <PieChart chartData={chartDataList} chartId={'1'} />
              </Col>
            </Row>
          </div>
        </div>
      </Container>
      <BottomBar />

      <Modal
        id="SendTokens"
        title="Send Tokens"
        okLabel="Send"
        titleIcon="fa-money-bill-alt"
      >
        <Row>
          <Col size="12" className="my-2">
            <FormInput
              name="amount"
              caption="Amount you will send"
              placeholder="Amount"
            />
          </Col>
          <Col size="12" className="my-2 mt-3">
            <FormInput
              name="address"
              caption="Recipient Address"
              placeholder="Address"
            />
          </Col>
        </Row>
      </Modal>

      <Modal
        id="BurnTokens"
        title="Burn Tokens"
        okLabel="Burn"
        titleIcon="fa-fire"
      >
        <Row className="row">
          <Col size="12" className="my-2">
            <FormInput
              name="amount"
              caption="Amount you will burn"
              placeholder="Amount"
            />
          </Col>
        </Row>
      </Modal>

      <Modal
        id="RateChange"
        title="Change Token Sale Rate"
        okLabel="Set New Rate"
        titleIcon="fa-file-invoice-dollar"
      >
        <Row>
          <Col size="12" className="my-2">
            <FormInput
              caption="Enter new sale rate"
              name=""
              placeholder="New Rate"
            />
          </Col>
        </Row>
      </Modal>
    </div>
  );
}
