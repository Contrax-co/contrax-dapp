// @ts-nocheck
import { useState, useEffect } from "react";
import { gql, useQuery } from "@apollo/client";
import { ethers } from "ethers";
import swal from "sweetalert";
import { getUserSession } from "../../store/localStorage";
import LoadingSpinner from "../../components/spinner/spinner";
import { CustomDialog, useDialog } from "react-st-modal";

import BottomBar from "../../components/bottomBar/BottomBar";
import Button from "../../components/button/Button";
import { H2, H3 } from "../../components/text/Text";
import { Col, Container, Row } from "../../components/blocks/Blocks";
import { Form } from "../../components/form/Form";
import { StyledDropBtn } from "../../components/form/dropdownInput/DropdownInput.styles";
import TokenModal from "../../components/OwnTokenModal";
import TokenModal1 from "../../components/CustomToken";
import Pools from "./Pools";

import abi from "../../config/sushiswap.json";
import ercabi from "../../config/erc20.json";
import factory from "../../config/pool.json";
import Modals from "./modal/modal";
import OwnModals from "./modal/OwnModal";
import "./createPool.css";
export default function CreatePools({ lightMode }: any) {
  const { ethereum } = window;
  const [openModalFrom, setOpenModalFrom] = useState(false);
  const [openModalTo, setOpenModalTo] = useState(false);
  const [tokenOne, setTokenOne] = useState<any | null>(null);
  const [tokenTwo, setTokenTwo] = useState<any | null>(null);
  const [walletAddress, setWalletAddress] = useState(null);

  const [tokenOneAmount, setTokenOneAmount] = useState("");
  const [tokenTwoAmount, setTokenTwoAmount] = useState("");

  const [dtoken, setDTokens] = useState<any[]>([]);
  const [wallet, setWallet] = useState();
  const [values, setValues] = useState([]);
  const [data, setData] = useState([]);
  const [tokenId1, setTokenId1] = useState<any | null>(null);
  const [tokenSymbol, setTokenSymbols] = useState<any | null>(null);
  const [tokenId2, setTokenId2] = useState<any | null>(null);
  const [tokenSymbols, setTokenSymbolss] = useState<any | null>(null);
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
      id: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
      name: "USDC",
      symbol: "USDC",
    },
    {
      id: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
      name: "USDT",
      symbol: "USDT",
    },
    {
      id: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
      name: "DAI",
      symbol: "DAI",
    },
    {
      id: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
      name: "WETH",
      symbol: "WETH",
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
    getBalance();
  }, []);

  useEffect(() => {
    fetch(
      `https://api.covalenthq.com/v1/42161/address/${wallet}/balances_v2/?quote-currency=USD&format=JSON&nft=false&no-nft-fetch=true/`,
      {
        method: "GET",
        headers: {
          Authorization: "Basic Y2tleV81YzcwODllZTFiMTQ0NWM3Yjg0NjcyYmFlM2Q6",
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => response.json())
      .then((items) => {
        console.log(items.data.items);
        setData(items.data.items);
      })
      .catch((error) => {
        console.log("sorry");
        console.log(error);
      });
  }, [wallet]);
  async function getBalance(item) {
    try {
      console.log(tokenId1, tokenSymbol);
      const tokenABI = ercabi.abi;
      const tokenAddress: any = tokenOne.contract_address;
      const tokenAddressb: any = tokenTwo.id;
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const TOKEN = new ethers.Contract(
        item.contract_address,
        tokenABI,
        signer
      );
      const TOKENB = new ethers.Contract(item, tokenABI, signer);
      const a = await TOKEN.balanceOf(wallet);
      const bc = ethers.utils.formatEther(a);
      const b = await TOKEN.balanceOf(wallet);
      console.log(bc, b);
    } catch (error) {
      console.log(error);
    }
  }
  async function handleCreatePool() {
    console.log(
      tokenOneAmount,
      tokenTwoAmount,
      tokenId1,
      tokenId2
    );
    const contractAddress = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506";
    const factoryAddress = "0x87e49e9B403C91749dCF89be4ab1d400CBD4068C";
    const contractABI = factory;
    const tokenABI = ercabi.abi;
    // const factoryABI = factory;
    const tokenAddress: any =tokenId1;
    const tokenAddressb: any =    tokenId2;
    console.log(tokenAddress, tokenAddressb);
    const amount1: any = tokenOneAmount;
    const amount2: any = tokenTwoAmount;

    try {
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
      console.log(amountIn1, amountIn2, amount1Min, amount2Min);
      const hx = await factory.createLp(
        tokenAddress,
        tokenAddressb,
        amountIn1,
        amountIn2,
        amount1Min,
        amount2Min,
        {
          gasLimit: provider.getGasPrice(),
        }
      );

      const hash = await hx.wait();
      console.log(hash, hx);
      if (hash) {
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
        }).then((value) => {
          switch (value) {
            case "Transaction":
              window.open(`https://arbiscan.io/tx/${hx.hash}`, "_blank");
              break;
            default:
          }
        });
      }
    } catch (e) {}

    // swal('Create Pool Transaction is in Process', 'Please Follow Metamask ');
  }
  return (
    <>
      <div className="pages">
        <div className={`containeres ${lightMode && "containeres-light"}`}>
          <h1>Create a Pool</h1>
       
          <form className="forms">
            <div className="rows">
              <div className="column">
                <button
                  type="button"
                  onClick={() => setOpenModalFrom(true)}
                  className={`inputes ${lightMode && "inputes-light"}`}
                >
                  {tokenSymbol ? tokenSymbol : "Select Token"}
                </button>
              </div>
              <div className="column">
                <button
                  type="button"
                  onClick={() => setOpenModalTo(true)}
                  className={`inputes ${lightMode && "inputes-light"}`}
                >
                  {tokenSymbols ? tokenSymbols : "Select Token"}
                </button>
              </div>
            </div>

            <label htmlFor="subject">{tokenSymbol} Amount</label>
            {tokenSymbol ? (
              <input
                className={`inputes ${lightMode && "inputes-light"}`}
                type="number"
                id="subject"
                placeholder="0"
                onChange={(e) => setTokenOneAmount(e.target.value)}
              />
            ) : (
              <input
                className={`inputes ${lightMode && "inputes-light"}`}
                type="number"
                id="subject"
                placeholder="0%"
               
                disabled="disabled"
              />
            )}

            <label htmlFor="subject">{tokenSymbols} Amount</label>
            {tokenSymbols ? (
              <input
                className={`inputes ${lightMode && "inputes-light"}`}
                type="number"
                id="subject"
                placeholder="0"
                onChange={(e) => setTokenTwoAmount(e.target.value)}
              />
            ) : (
              <input
                className={`inputes ${lightMode && "inputes-light"}`}
                type="number"
                id="subject"
                placeholder="0%"
               
                disabled="disabled"
              />
            )}
          </form>
          <div className="buttones">
            <button type="button" onClick={handleCreatePool} className="buttonsss">
              Create a Pool
            </button>
          </div>
        </div>

        {openModalFrom ? (
          <Modals
            tokens={StableTOKEN}
            setOpenModal={setOpenModalFrom}
            lightMode={lightMode}
            setTokenId={setTokenId1}
            setTokenSymbol={setTokenSymbols}
          />
        ) : null}
        {openModalTo ? (
          <OwnModals
            tokens={data}
            setOpenModal={setOpenModalTo}
            lightMode={lightMode}
            setTokenId={setTokenId2}
            setTokenSymbol={setTokenSymbolss}
          />
        ) : null}

        <Pools lightMode={lightMode}/>
      </div>
      {/* <BottomBar /> */}
    </>
  );
}
