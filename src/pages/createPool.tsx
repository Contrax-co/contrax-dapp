// @ts-nocheck
import { useState, useEffect } from 'react';
import { gql, useQuery } from '@apollo/client';
import { ethers } from 'ethers';
import swal from 'sweetalert';
import { getUserSession } from '../store/localStorage';
import "./Application.css"
import BottomBar from '../components/bottomBar/BottomBar';
import Button from '../components/button/Button';
import { H2, H3 } from '../components/text/Text';
import { Col, Container, Row } from '../components/blocks/Blocks';
import { Form } from '../components/form/Form';
import { StyledDropBtn } from '../components/form/dropdownInput/DropdownInput.styles';
import TokenModal from '../components/OwnTokenModal';
import TokenModal1 from '../components/CustomToken';
import Pools from '../components/pools';

import abi from '../config/sushiswap.json';
import ercabi from '../config/erc20.json';
import factory from '../config/pool.json';



export default function CreatePool({ lightMode }: any) {
  const { ethereum } = window;

  const [tokenOne, setTokenOne] = useState<any | null>(null);
  const [tokenTwo, setTokenTwo] = useState<any | null>(null);
  const [walletAddress, setWalletAddress] = useState(null);

  const [tokenOneAmount, setTokenOneAmount] = useState('');
  const [tokenTwoAmount, setTokenTwoAmount] = useState('');

  const [dtoken, setDTokens] = useState<any[]>([]);
  const [wallet, setWallet] = useState();
  const [values, setValues] = useState([]);

  
  useEffect(() => {
    let walletData: any;
    let sessionData = getUserSession();
    if (sessionData) {
      walletData = JSON.parse(sessionData);
      setWallet(walletData.address);
     
    }
  });

  const StableTOKEN = [
    {
      id: '0xDB6bbEBdF9515f308e9d9690aeF0796d4fF7F999',
      name: 'USDC',
      symbol: 'USDC',
    },
    {
      id: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
      name: 'USDT',
      symbol: 'USDT',
    },
    {
      id: '0xDF1742fE5b0bFc12331D8EAec6b478DfDbD31464',
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
      tokenOne.contract_address,
      tokenTwo.id
    );
    const contractAddress = '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506';
    const factoryAddress = '0x87e49e9B403C91749dCF89be4ab1d400CBD4068C';
    const contractABI = factory;
    const tokenABI = ercabi.abi;
    // const factoryABI = factory;
    const tokenAddress: any = tokenOne.contract_address;
    const tokenAddressb: any = tokenTwo.id;
    console.log(tokenAddress, tokenAddressb);
    const amount1: any = tokenOneAmount;
    const amount2: any = tokenTwoAmount;

    if (amount1 === amount2) {
      const amount1min: any = 0;
      const amount2min: any = 0;

      const amountIn1 = ethers.utils.parseEther(amount1.toString());
      const amountIn2 = ethers.utils.parseEther(amount2.toString());

      const amount1Min = ethers.utils.parseEther(amount1min.toString());
      const amount2Min = ethers.utils.parseEther(amount2min.toString());

      const time = Math.floor(Date.now() / 1000) + 200000;
      const deadline = ethers.BigNumber.from(time);

      const userAddress = wallet;

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      // const router = new ethers.Contract(contractAddress, contractABI, signer);
      const factory = new ethers.Contract(factoryAddress, contractABI, signer);
      const TOKEN = new ethers.Contract(tokenAddress, tokenABI, signer);
      const TOKENB = new ethers.Contract(tokenAddressb, tokenABI, signer);

      // await factory.createPair(tokenAddress, tokenAddressb);

      await TOKEN.approve(factoryAddress, amountIn1);
      await TOKENB.approve(factoryAddress, amountIn2);
console.log(amountIn1,amountIn2,amount1Min,amount2Min)
      const hx = await factory.createLp(
        tokenAddress,
        tokenAddressb,
        amountIn1,
        amountIn2,
        amount1Min,
        amount2Min,
        {
          gasLimit: 500000,
        }
      );

      const hash =await hx.wait();
      console.log(hash,hx);
if(hash){
  swal({
    title: "Pool Deployed",
    text: "Your Pool is Deployed.",
    icon: "success",

    buttons: {
      ok: "CLOSE!",
      Transaction: {
        value: "Transaction",
      },

    },
  })
    .then((value) => {
      switch (value) {
        case "Transaction":

          window.open(
            `https://arbiscan.io/tx${hx.hash}`, "_blank");
          break;
        default:

      }

    });
}
      // swal('Create Pool Transaction is in Process', 'Please Follow Metamask ');
    } else {
      swal('TokenA Amount  and TokenB Amount Should be same ');
    }
  }
  return (
    <>
      <Container className="h-100 pool">
        <Row>
          <Col size="12" className="pt-5">
            <div 
             className={`pool__container ${lightMode && 'pool__container--light'}`}
            >
            {/* <Form 
            
            className='shadow px-4 my-5 bg-dark'
            > */}
              <Row>
                <Col size="12" className="my-2 create-pool-title">
                  <H2><div className={`swap_title ${lightMode && 'swap_title--light'}`}>
                    Create Pool
                    </div></H2>
                </Col>
                <Row>
                  <Col size="1" />
                  <Col size="10" className="my-2">
                    <Col size="12">
                      <Col className="mb-22">
                        <H3>
                        <div className={`swap_title ${lightMode && 'swap_title--light'}`}>
                          Select Pair</div></H3>
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
                                ? String(tokenOne['contract_name'])
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
                        <H3><div className={`mt-3 swap_title ${lightMode && 'swap_title--light'}`}>
                          Deposit Amount</div></H3>
                      </Col>
                      <Col>
                        {tokenOne ? (
                          <div className="depositAmount-group">
                            <div  className={`selectedToken-div swap_title ${lightMode && 'swap_title--light'}`} >
                              {tokenOne &&
                                String(tokenOne['contract_name'])
                                  .split(' ')[0]
                                  .trim()}
                            </div>

                          
                            <input
                              value={tokenOne['tokenaddress']}
                              onChange={(e) => setTokenOne(e.target.value)}
                              type={'hidden'}
                              className={`from__input ${lightMode && 'from__input--light'}`}
                            />
                    
                            
                            <input
                              onChange={(e) =>
                                setTokenOneAmount(e.target.value)
                              }
                              placeholder="0.0"
                              type={'number'}
                              className={`from__input-pool ${lightMode && 'from__input--light-pool'}`}
                            />
                          
                          </div>
                        ) : (
                          <div className="select-a-token">Select a Token</div>
                        )}
                      </Col>
                      <Col>
                        {tokenTwo ? (
                          <div className="depositAmount-group">
                            <span className={`selectedToken-div swap_title ${lightMode && 'swap_title--light'}`}>
                              {tokenTwo &&
                                String(tokenTwo['symbol']).split(' ')[0].trim()}
                            </span>
                             <div >
                            <input
                              value={tokenTwo['id']}
                              onChange={(e) => setTokenTwo(e.target.value)}
                              type={'hidden'}
                              className={`from__input ${lightMode && 'from__input--light'}`}
                            />
                            <input
                              onChange={(e) =>
                                setTokenTwoAmount(e.target.value)
                              }
                              placeholder="0.0"
                              type={'number'}
                              className={`from__input-pool ${lightMode && 'from__input--light-pool'}`}
                            />
                          </div>
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
            </div> 
            {/* </Form> */}
            
          </Col>
        </Row>
        <div className='mt-5'>
        <Pools  lightMode={lightMode}/>
        </div>
      </Container>
      <BottomBar />
      <TokenModal
        id="tokenModal"
        lightMode={lightMode}
        standardTokens={values}
        onSelection={(item: any) => {
          setTokenOne(item);
        }}
      />
      <TokenModal1
        id="tokenModalTwo"
        lightMode={lightMode}
        standardTokens={dtoken}
        onSelection={(item: any) => {
          setTokenTwo(item);
        }}
      />
    </>
  );
}
