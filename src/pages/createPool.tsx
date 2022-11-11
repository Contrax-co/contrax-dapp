// @ts-nocheck
import { useState, useEffect } from 'react';
import BottomBar from '../components/bottomBar/BottomBar';
import { H2, H3 } from '../components/text/Text';
import Button from '../components/button/Button';
import { Form } from '../components/form/Form';
import { Col, Container, Row } from '../components/blocks/Blocks';
import TokenModal from '../components/TokenModal';
import { StyledDropBtn } from '../components/form/dropdownInput/DropdownInput.styles';
import { gql, useQuery } from '@apollo/client';
import { ethers } from 'ethers';
import { getUserSession } from '../store/localStorage';
import swal from 'sweetalert';
import TokenModal1 from '../components/TokenModal1';
import abi from '../config/sushiswap.json';
import ercabi from '../config/erc20.json';
import factory from '../config/factory.json';
import Pools from '../components/pools';

// const axios = require('axios');

const FETCH = gql`
  query MyQuery($chainId: String!, $userwallet: String!) {
    tokens(
      where: {
        chainId: { _like: $chainId }
        userwallet: { _like: $userwallet }
      }
    ) {
      userwallet
      totalSupply
      tokenaddress
      chainId
      decimal
      id
      tokenName
      tokenSymbol
    }
  }
`;

export default function CreatePool() {
  const { ethereum } = window;

  const [tokenOne, setTokenOne] = useState<any | null>(null);
  const [tokenTwo, setTokenTwo] = useState<any | null>(null);
  const [walletAddress, setWalletAddress] = useState(null);

  const [tokenOneAmount, setTokenOneAmount] = useState('');
  const [tokenTwoAmount, setTokenTwoAmount] = useState('');

  const [dtoken, setDTokens] = useState<any[]>([]);
  const [wallet, setWallet] = useState();
  const [values, setValues] = useState([]);

  const { data } = useQuery(FETCH, {
    variables: {
      chainId: '421611',
      userwallet: wallet,
    },
  });
  useEffect(() => {
    let walletData: any;
    let sessionData = getUserSession();
    if (sessionData) {
      walletData = JSON.parse(sessionData);
      setWallet(walletData.address);
      const a = data;
      if (typeof a !== 'undefined') {
        console.log(a.tokens);
        setValues(a.tokens);
        console.log(values);
      }
    }
  });

  const StableTOKEN = [
    {
      id: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
      name: 'USDC',
      symbol: 'USDC',
    },
    {
      id: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
      name: 'USDT',
      symbol: 'USDT',
    },
    {
      id: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
      name: 'DAI',
      symbol: 'DAI',
    },
    {
      id: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
      name: 'WETH',
      symbol: 'WETH',
    },
    {
      id: '0x9D575a9bF57a5e24a99D29724B86ca021A2b0435',
      name: 'ETH',
      symbol: 'ETH',
    },
  ];

  const getApiDetails = async () => {
    try {
      setDTokens(StableTOKEN);
      console.log(dtoken);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    const tempData = getUserSession();
    console.log(tempData);

    if (tempData) {
      const walletData = JSON.parse(tempData);
      setWalletAddress(walletData.address);
    }
  }, []);

  useEffect(() => {
    getApiDetails();
  }, []);

  async function handleCreatePool() {
    console.log(
      tokenOneAmount,
      tokenTwoAmount,
      tokenOne.tokenaddress,
      tokenTwo.id
    );
    const contractAddress = '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506';
    const factoryAddress = '0xc35DADB65012eC5796536bD9864eD8773aBc74C4';
    const contractABI = abi;
    const tokenABI = ercabi.abi;
    const factoryABI = factory;
    const tokenAddress: any = tokenOne.tokenaddress;
    const tokenAddressb: any = tokenTwo.id;
    console.log(tokenAddress, tokenAddressb);
    const amount1: any = tokenOneAmount;
    const amount2: any = tokenTwoAmount;

    if (amount1 === amount2) {
      const amount1min: any = amount1 - 1;
      const amount2min: any = amount2 - 1;

      const amountIn1 = ethers.utils.parseEther(amount1.toString());
      const amountIn2 = ethers.utils.parseEther(amount2.toString());

      const amount1Min = ethers.utils.parseEther(amount1min.toString());
      const amount2Min = ethers.utils.parseEther(amount2min.toString());

      const time = Math.floor(Date.now() / 1000) + 200000;
      const deadline = ethers.BigNumber.from(time);

      const userAddress = wallet;

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const router = new ethers.Contract(contractAddress, contractABI, signer);
      const factory = new ethers.Contract(factoryAddress, factoryABI, signer);
      const TOKEN = new ethers.Contract(tokenAddress, tokenABI, signer);
      const TOKENB = new ethers.Contract(tokenAddressb, tokenABI, signer);

      await factory.createPair(tokenAddress, tokenAddressb);

      await TOKEN.approve(contractAddress, amountIn1);
      await TOKENB.approve(contractAddress, amountIn2);

      const hx = await router.addLiquidity(
        tokenAddress,
        tokenAddressb,
        amountIn1,
        amountIn2,
        amount1Min,
        amount2Min,
        userAddress,
        deadline,
        {
          gasLimit: 300000,
        }
      );

      const hash = hx.wait();
      console.log(hash);

      swal('Create Pool Transaction is in Process', 'Please Follow Metamask ');
    } else {
      swal('TokenA Amount  and TokenB Amount Should be same ');
    }
  }
  return (
    <>
      <Container className="h-100 pool">
        <Row>
          <Col size="12" className="pt-5">
            <Form className="px-4 my-5">
              <Row>
                <Col size="12" className="my-2 create-pool-title">
                  <H2>Create Pool</H2>
                </Col>
                <Row>
                  <Col size="1" />
                  <Col size="10" className="my-2">
                    <Col size="12">
                      <Col className="mb-22">
                        <H3>Select Pair</H3>
                      </Col>
                      <Row>
                        <Col>
                          <StyledDropBtn
                            className="btn dropdown-toggle"
                            type="button"
                            data-bs-target="#tokenModal"
                            data-bs-toggle="modal"
                            aria-expanded="false"
                            style={{ width: '100%', borderRadius: 4 }}
                          >
                            <div className="create-pool-tokenDropdown">
                              {tokenOne
                                ? String(tokenOne['tokenName'])
                                    .split(' ')[0]
                                    .trim()
                                : 'Select a token'}
                            </div>
                          </StyledDropBtn>
                        </Col>
                        <Col>
                          <StyledDropBtn
                            className="btn dropdown-toggle"
                            type="button"
                            data-bs-target="#tokenModalTwo"
                            data-bs-toggle="modal"
                            aria-expanded="false"
                            style={{ width: '100%', borderRadius: 4 }}
                          >
                            <div className="create-pool-tokenDropdown">
                              {tokenTwo
                                ? String(tokenTwo['symbol'])
                                    .split(' ')[0]
                                    .trim()
                                : 'Select a token'}
                            </div>
                          </StyledDropBtn>
                        </Col>
                      </Row>
                    </Col>
                    <Col size="12" className="depositAmount">
                      <Col className="mb-22">
                        <H3>Deposit Amount</H3>
                      </Col>
                      <Col>
                        {tokenOne ? (
                          <div className="depositAmount-group">
                            <div className="selectedToken-div">
                              {tokenOne &&
                                String(tokenOne['tokenName'])
                                  .split(' ')[0]
                                  .trim()}
                            </div>
                            <input
                              value={tokenOne['tokenaddress']}
                              onChange={(e) => setTokenOne(e.target.value)}
                              type={'hidden'}
                              className="depositAmount-input"
                            />
                            <input
                              onChange={(e) =>
                                setTokenOneAmount(e.target.value)
                              }
                              placeholder="0.0"
                              type={'number'}
                              className="depositAmount-input"
                            />
                          </div>
                        ) : (
                          <div className="select-a-token">Select a Token</div>
                        )}
                      </Col>
                      <Col>
                        {tokenTwo ? (
                          <div className="depositAmount-group">
                            <span className="selectedToken-div">
                              {tokenTwo &&
                                String(tokenTwo['symbol']).split(' ')[0].trim()}
                            </span>
                            <input
                              value={tokenTwo['id']}
                              onChange={(e) => setTokenTwo(e.target.value)}
                              type={'hidden'}
                              className="depositAmount-input"
                            />
                            <input
                              onChange={(e) =>
                                setTokenTwoAmount(e.target.value)
                              }
                              placeholder="0.0"
                              type={'number'}
                              className="depositAmount-input"
                            />
                          </div>
                        ) : (
                          <div className="select-a-token">Select a Token</div>
                        )}
                      </Col>
                      <Col>
                        {' '}
                        <Button
                          className="row justify-content-center mt-2 mb-2 btnCreatePool"
                          label={'Create Pool'}
                          primary
                          onClick={handleCreatePool}
                        />
                      </Col>
                    </Col>
                  </Col>
                  <Col size="1" />
                </Row>
              </Row>
            </Form>
          </Col>
        </Row>
        <Pools />
      </Container>
      <BottomBar />
      <TokenModal
        id="tokenModal"
        standardTokens={values}
        onSelection={(item: any) => {
          setTokenOne(item);
        }}
      />
      <TokenModal1
        id="tokenModalTwo"
        standardTokens={dtoken}
        onSelection={(item: any) => {
          setTokenTwo(item);
        }}
      />
    </>
  );
}
