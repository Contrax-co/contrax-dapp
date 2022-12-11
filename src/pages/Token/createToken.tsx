// @ts-nocheck
import { useEffect, useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { ethers } from "ethers";
import swal from "sweetalert";
import { useInput } from "rooks";
import { getUserSession } from "../../store/localStorage";
import "./createToken.css";
import BottomBar from "../../components/bottomBar/BottomBar";
import Button from "../../components/button/Button";
import { Title, Desc, DescSpan, H3 } from "../../components/text/Text";
import { Col, Container, Row } from "../../components/blocks/Blocks";
import { FormInput, FormCheckbox, Form } from "../../components/form/Form";
import { Modal } from "../../components/modal/Modal";
import Tokens from "./tokens";
import LoadingSpinner from "../../components/spinner/spinner";

const contractFile = require("../../config/erc20.json");

declare global {
  interface Window {
    ethereum: any;
  }
}

export default function CreateToken({ lightMode }: any) {
  const [tokenSymbol,setTokenSymbol] = useState("");
  const [tokenSupply,setTokenSupply] = useState("");
  const [tokenName,setTokenName] = useState("");
  const [tokenDecimal,setTokenDecimal] = useState("");
  const [tokenBurn,setTokenBurn] = useState(false);
  const [tokenBurnValue,setTokenBurnValue] = useState("");
  const [tokenTradingFee,setTokenTradingFee] = useState(false);
  const [tokenTradingFeeValue,setTradingFeeValue] = useState("");
  const [tokenSupportSupplyIncrease,setTokenSupportSupplyIncrease] = useState(false);




  const [tokenAddress, setTokenAddress] = useState();
  const [wallet, setWallet] = useState();
  const [decimals, setDecimal] = useState();
  const [totalSupply, setTotalSupply] = useState();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let walletData: any;
    let sessionData = getUserSession();
    if (sessionData) {
      walletData = JSON.parse(sessionData);
      setWallet(walletData.address);
    }
  }, []);

  const handleSubmit = async () => {

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const { chainId } = await provider.getNetwork();
    console.log(chainId);
    let name = tokenName;
    let symbol = tokenSymbol;
    let decimal = Number(tokenDecimal);
    let burnPercantageIdentifier = tokenBurn === "on" ? true : false;
    let initialSupply = Number(tokenSupply);
    let mintable = tokenSupportSupplyIncrease === "on" ? true : false;
    let burnPercentage = Number(tokenBurnValue);
    let transactionFeePercentage = Number(tokenTradingFeeValue);
    let transactionFeePercentageIdentiier =
      tokenTradingFee === "on" ? true : false;

    const ldecimal = 1;
    const hdecimal = 19;
    const lts = -1;
    const hts = 99999999999999999;

    if (decimal > ldecimal && decimal < hdecimal) {
      if (symbol.length < 16) {
        if (initialSupply > lts && initialSupply < hts) {
          if (name.length < 64) {
            setIsLoading(true);
            const dec: any = decimal.toString();
            setDecimal(dec);
            const ts: any = initialSupply.toString();
            setTotalSupply(ts);

            const metadata = contractFile;
            console.log(metadata);
            const factory = new ethers.ContractFactory(
              metadata.abi,
              metadata.bytecode,
              signer
            );

            const contract = await factory.deploy(
              name,
              symbol,
              decimal,
              initialSupply,
              burnPercentage,
              burnPercantageIdentifier,
              transactionFeePercentage,
              transactionFeePercentageIdentiier,
              mintable
            );
            contract.deployed();

            const add = contract.address;
            setTokenAddress(add);
            const addd = await contract.deployTransaction.wait();
            console.log(addd.blockNumber);

            if (!addd.blockNumber) {
              console.log("something");
            } else {
              setIsLoading(false);

              swal({
                title: "Token Created!",
                text: "Please allow a few minutes for your token to appear in the Token Table ",
                icon: "success",
              }).then((data) => {});
            }
          } else {
            swal("Something went wrong", "Please add decimal in 1-64 numbers");
          }
        } else {
          swal(
            "Something went wrong",
            "Token Supply decimal input is out of range"
          );
        }
      } else {
        swal("Something went wrong", "Token Name is above 16 character");
      }
    } else {
      swal(
        "Something went wrong",
        "Please do not enter any decimal points in the Decimal Field and make sure the number is between 1 and 18"
      );
    }
  };

  return (
    <>
   <div className="whole__exchange__container">
      <div className={`containers ${lightMode && "containers-light"}`}>
        
        <h1>Enter Token Parameters</h1>

        <form className="forms">
          <div className="rows">
            <div className="column">
              <label>Token Name</label>
              <input
                className={`inputs ${lightMode && "inputs-light"}`}
                type="text"
                id="name"
                placeholder="Token Name"
                onChange={(e) => setTokenName(e.target.value)}
              />
            </div>
            <div className="column">
              <label htmlFor="email">Token Symbol</label>
              <input
                className={`inputs ${lightMode && "inputs-light"}`}
                type="text"
                id="email"
                placeholder="Token Symbol"
                onChange={(e) => setTokenSymbol(e.target.value)}
              />
            </div>
          </div>
          <div className="rows">
            <div className="column">
              <label htmlFor="subject">Token Supply</label>
              <input
                className={`inputs ${lightMode && "inputs-light"}`}
                type="number"
                id="subject"
                placeholder="Total Supply"
                onChange={(e) => setTokenSupply(e.target.value)}
              />
            </div>
            <div className="column">
              <label htmlFor="contact">Decimals</label>
              <input
                className={`inputs ${lightMode && "inputs-light"}`}
                type="number"
                id="contact"
                placeholder="Decimals"
                onChange={(e) => setTokenDecimal(e.target.value)}
              />
            </div>
          </div>
          <h1>Special Features</h1>
          <div className="rows-check">
            <div className="one">
              <label className="form-controlss">
                <input onChange={(e) => setTokenBurn(true)} type="checkbox" name="checkbox" /> Burn
              </label>
              <p>
                A percentage of tokens will be sent to the burn address for each
                on-chain transfer
              </p>
            </div>

            <input
              className={`inputs-check ${lightMode && "inputs-check-light"}`}
              type="number"
              id="contact"
              placeholder="0%"
              onChange={(e) => setTokenBurnValue(e.target.value)}
            />
          </div>
          <div className="rows-check">
            <div className="one">
              <label className="form-controlss">
                <input onChange={(e) => setTokenTradingFee(true)} type="checkbox" name="checkbox" />
                Trading Fees
              </label>
              <p>
                A percentage of tokens will be sent to the creators address for
                each on-chain transfer
              </p>
            </div>
            <input
              className={`inputs-check ${lightMode && "inputs-check-light"}`}
              type="number"
              id="contact"
              placeholder="0%"
              onChange={(e) => setTradingFeeValue(e.target.value)}
            />
          </div>
          <label className="form-controlss">
            <input onChange={(e) => setTokenSupportSupplyIncrease(true)} type="checkbox" name="checkbox" />
            Supports Supply Increase
          </label>
          <p>
            Allows the creator to issue additional tokens after the token
            creation
          </p>
        </form>
        <div className="buttons">
        {!isLoading ? (
          <button onClick={handleSubmit} type="button" className="buttonss">
            Create a Token
          </button>
        ) : (
          <div style={{ marginLeft: "20%" }}>
          <LoadingSpinner />
        </div>
        )
}
        </div>
        
      </div>
      
<Tokens lightMode={lightMode}/>
</div>
      {/* <BottomBar /> */}
    </>
  );
}
