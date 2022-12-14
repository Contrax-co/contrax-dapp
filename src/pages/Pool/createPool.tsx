// @ts-nocheck
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import swal from "sweetalert";
import { getUserSession } from "../../store/localStorage";
import Pools from "./Pools";
import ercabi from "../../config/erc20.json";
import factory from "../../config/pool.json";
import Modals from "./modal/modal";
import OwnModals from "./modal/OwnModal";
import "./createPool.css";
import LoadingSpinner from "../../components/spinner/spinner";
export default function CreatePools({ lightMode }: any) {
  const { ethereum } = window;
  const [openModalFrom, setOpenModalFrom] = useState(false);
  const [openModalTo, setOpenModalTo] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [tokenOneAmount, setTokenOneAmount] = useState("");
  const [tokenTwoAmount, setTokenTwoAmount] = useState("");
  const [dtoken, setDTokens] = useState<any[]>([]);
  const [wallet, setWallet] = useState();
  const [data, setData] = useState([]);
  const [tokenId1, setTokenId1] = useState<any | null>(null);
  const [tokenSymbol, setTokenSymbols] = useState<any | null>(null);
  const [tokenId2, setTokenId2] = useState<any | null>(null);
  const [tokenSymbols, setTokenSymbolss] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
      name: "USD Coin",
      symbol: "USDC",
    },
    {
      id: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
      name: "USD Tether",
      symbol: "USDT",
    },
    {
      id: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
      name: "DAI Stablecoin",
      symbol: "DAI",
    },
    {
      id: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
      name: "Wrapped ETH",
      symbol: "WETH",
    },
  ];

  const getApiDetails = async () => {
    try {
      setDTokens(StableTOKEN);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    const tempData = getUserSession();
    if (tempData) {
      const walletData = JSON.parse(tempData);
      setWalletAddress(walletData.address);
    }
  }, []);

  useEffect(() => {
    getApiDetails();
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
        setData(items.data.items);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [wallet]);

  async function handleCreatePool() {
    const factoryAddress = "0x87e49e9B403C91749dCF89be4ab1d400CBD4068C";
    const contractABI = factory;
    const tokenABI = ercabi.abi;
    // const factoryABI = factory;
    const tokenAddress: any = tokenId1;
    const tokenAddressb: any = tokenId2;
    const amount1: any = tokenOneAmount;
    const amount2: any = tokenTwoAmount;
    setIsLoading(true);
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
      if (hash) {
        setIsLoading(false);
        swal({
          title: "Pool Deployed!",
          text: "Please allow a few minutes to see your pool in the table, and another day or two from SushiSwap to actually display the pool.",
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
    } catch (e) {
      setIsLoading(false);
    }

    // swal('Create Pool Transaction is in Process', 'Please Follow Metamask ');
  }
  return (
    <>
      <div className="pagess">
      <div  className={`pool__header ${lightMode && "pool-header-light"}`}>
        <h1
        >
Create Pool
        </h1>
      </div>
        <div className={`containeres ${lightMode && "containeres-light"}`}>
          <h1>Create a Pool</h1>

          <form className="forms">
            <div className="rows">
              <div className="column">
                <button
                  type="button"
                  onClick={() => setOpenModalTo(true)}
                  className={`inputesbtn ${lightMode && "inputesbtn-light"}`}
                >
                  {tokenSymbols ? tokenSymbols : "Select Created Token"}
                </button>
              </div>
              <div className="column">
                <button
                  type="button"
                  onClick={() => setOpenModalFrom(true)}
                  className={`inputesbtn ${lightMode && "inputesbtn-light"}`}
                >
                  {tokenSymbol ? tokenSymbol : "Select Existing Token"}
                </button>
              </div>
            </div>

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
                placeholder="0"
                disabled="disabled"
              />
            )}

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
                placeholder="0"
                disabled="disabled"
              />
            )}
          </form>
          {isLoading ? (
            <div style={{ marginLeft: "45%" }}>
              <LoadingSpinner />{" "}
            </div>
          ) : (
            <div className="buttones">
              {tokenOneAmount && tokenTwoAmount ? (
                <button
                  type="button"
                  onClick={handleCreatePool}
                  className="buttonsss"
                >
                  Create a Pool
                </button>
              ) : (
                <button type="button" className="buttonss-disabled" disabled>
                  Create a Pool
                </button>
              )}
            </div>
          )}
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

        <Pools lightMode={lightMode} />
      </div>
      {/* <BottomBar /> */}
    </>
  );
}
