import { useState, useEffect } from 'react';
import {CgArrowsExchangeAltV} from 'react-icons/cg';
import SwapValuesFrom from './from/SwapValuesFrom';
import SwapValuesTo from './to/SwapValuesTo';
import { MoonLoader } from 'react-spinners';
import './Exchange.css';
import From from './from/From';
import To from './to/To';
import { swapEthForPair, swapEthForToken, swapFromTokenToPair, swapFromTokenToToken, 
  swapPairForETH, 
  swapPairForPair, swapPairForToken, swapTokenForETH
} from './exchange-functions';
import Confirm from './Confirm';
import {AiOutlineCheckCircle} from "react-icons/ai";
import {MdOutlineErrorOutline} from "react-icons/md";


var isLocalhost = false;
if (window.location.hostname === "localhost") {
  isLocalhost = true;
}

var fetchUrl = "https://testing.contrax.finance/api/poolswap.json";
if (isLocalhost) { fetchUrl = 'http://localhost:3000/api/poolswap.json'}

function Exchange({ lightMode, currentWallet }: any) {
  const [openModalFrom, setOpenModalFrom] = useState(false);
  const [openModalTo, setOpenModalTo] = useState(false);


  const[tokenId1, setTokenId1] = useState(1);
  const[tokenId2, setTokenId2] = useState(2);
  const [tokens, setTokens] = useState([]);

  const [value, setValue] = useState(0); 
  const [tokenType1, setTokenType1] = useState("");
  const [tokenType2, setTokenType2] = useState("");

  const [fromAddress, setFromAddress] = useState("");
  const [toAddress, setToAddress] = useState("");

  const [tokenAbi, setTokenAbi] = useState([]); 

  const [isLoading, setLoading] = useState(false);
  const [loaderMessage, setLoaderMessage] = useState('');
  const [secondaryMessage, setSecondaryMessage] = useState('');

  const [toValue, setToValue] = useState(0.0);

  const [confirmPage, setConfirmPage] = useState(false);
  const [fromName, setFromName] = useState(""); 
  const [toName, setToName] = useState(""); 

  const [fromImg, setFromImg] = useState("");
  const [toImg, setToImg] = useState("");
  const [fromAlt, setFromAlt] = useState("");
  const [toAlt, setToAlt] = useState("");


  const [success, setSuccess] = useState("loading");

  const [userAmt, setUserAmt] = useState(0);


  useEffect(() => {
    fetch(fetchUrl) //`http://localhost:3000/api/poolswap.json` or `https://testing.contrax.finance/api/pools.json` for when we want it done locally
      .then((response) => response.json())
      .then((data) => {
        setTokens(data);
      });
  }, []);

  return (
    <div className={`whole__exchange__container`}>
  
      <div className="exchange__header">
        <p
          className={`whole__container__title ${
            lightMode && 'whole__container__title--light'
          }`}
        >
          Exchange
        </p>
      </div>

      <div className={`swap__container ${lightMode && 'swap__container--light'}`}>
        <p className={`swap_title ${lightMode && 'swap_title--light'}`}>Swap</p>

        <div className={`from ${lightMode && 'from--light'}`}>
          
            <From 
              lightMode={lightMode}
              setOpenModal={setOpenModalFrom}
              tokens = {tokens}
              tokenId = {tokenId1}
              currentWallet={currentWallet}
              setValue = {setValue}
              setTokenType={setTokenType1}
              setFromAddress = {setFromAddress}
              setAbi = {setTokenAbi}
              fromAddress = {fromAddress}
              toAddress={toAddress}
              setToValue={setToValue}
              setFromName = {setFromName}
              setFromImg = {setFromImg}
              setFromAlt = {setFromAlt}
              toName={toName}
              tokenType1 = {tokenType1}
              tokenType2 = {tokenType2}
              setUserAmt = {setUserAmt}
            /> 

        </div>

        <div className={`exchange_icon`}>
          <CgArrowsExchangeAltV className={`exchange_icon2 ${lightMode && 'exchange_icon2--light'}`}/>
        </div>
        

        <div className={`to ${lightMode && 'to--light'}`}>

          <To 
            lightMode={lightMode}
            setOpenModal={setOpenModalTo}
            tokens = {tokens}
            tokenId={tokenId2}
            setTokenType={setTokenType2}
            setToAddress = {setToAddress}
            setToValue = {setToValue}
            toValue = {toValue}
            toAddress = {toAddress}
            setToName = {setToName}
            setToImg = {setToImg}
            setToAlt = {setToAlt}
            currentWallet = {currentWallet}
          />

        </div>

          {!value || value <= 0 ? (
            <div className={`exchange_button_disable ${lightMode && 'exchange_button_disable--light'}`}>
                <p>Enter a amount</p>
            </div>

          ) : value > userAmt ? (

            <div className={`exchange_button_disable ${lightMode && 'exchange_button_disable--light'}`} >
                <p>Insufficient Balance</p>
            </div>

          ): (
            <div className={`exchange_button ${lightMode && 'exchange_button--light'}`} 
              onClick={() => setConfirmPage(true)}
            >
                <p>See details</p>
            </div>

          )}
         
      </div>

      {openModalFrom ? (
        <SwapValuesFrom
          tokens={tokens}
          setOpenModal={setOpenModalFrom}
          lightMode={lightMode}
          setTokenId = {setTokenId1}
        />
      ) : null}

      {openModalTo ? (
        <SwapValuesTo
          tokens={tokens}
          setOpenModal={setOpenModalTo}
          lightMode={lightMode}
          setTokenId = {setTokenId2}
        />
      ) : null}

      {isLoading && (
        <div className={`exchange_spinner ${lightMode && 'exchange_spinner--light'}`}>

          <div className={`exchange_spinner_top`}>
            <div className="exchange_spinner-left">
            {success === "success" ? (
              <AiOutlineCheckCircle style={{color: "#00E600", fontSize: "20px"}}/> 
            ): (success === "loading") ? (
              <MoonLoader size={20} loading={isLoading} color={'rgb(89, 179, 247)'}/> 
            ): (success === "fail") ? (
              <MdOutlineErrorOutline style={{color:"#e60000"}} />
            ): null}
            
            </div>

              <div className={`exchange_spinner_right`}>
                <p style={{fontWeight:'700'}}>{loaderMessage}</p>
                <p className={`exchange_second`}>{secondaryMessage}</p>
              </div>

          </div>

          <div className={`exchange_spinner_bottom`} onClick={() => setLoading(false)}>
            <p>Dismiss</p>
          </div> 

        </div>
      )}

      {confirmPage && (
        <Confirm
          lightMode ={lightMode}
          setConfirmPage = {setConfirmPage}
          fromAddress = {fromAddress}
          toAddress = {toAddress}
          amount = {value}
          toAmount = {toValue}
          fromName={fromName}
          toName = {toName}
          fromImg = {fromImg}
          toImg = {toImg}
          fromAlt = {fromAlt}
          toAlt = {toAlt}
          swap = {() => {

            ((tokenType1 === "Token") && (tokenType2 === "Token") && (fromName !== "ETH") && (toName !== "ETH")) ? (
            swapFromTokenToToken(currentWallet, value, fromAddress, toAddress, setValue, tokenAbi, setLoading, setLoaderMessage, setSecondaryMessage, setSuccess)
            ): ((tokenType1 === "Token") && (tokenType2 === "LP Token") && (fromName !== "ETH") && (toName !== "ETH")) ? (
            swapFromTokenToPair(currentWallet, fromAddress, toAddress, tokenAbi, value, setValue, setLoading, setLoaderMessage, setSecondaryMessage, setSuccess)
            ): ((tokenType1 === "LP Token") && (tokenType2 === "Token") && (fromName !== "ETH") && (toName !== "ETH")) ? (
            swapPairForToken(currentWallet, fromAddress, toAddress, tokenAbi, value, setValue, setLoading, setLoaderMessage, setSecondaryMessage, setSuccess)
            ): (tokenType1 === "Token") && (tokenType2 === "Token") && (fromName === "ETH") ? (
            swapEthForToken(currentWallet, toAddress, value, setValue, setLoading, setLoaderMessage, setSecondaryMessage, setSuccess)
            ) : (tokenType1 === "Token") && (tokenType2 === "LP Token") && (fromName === "ETH") ? (
            swapEthForPair(currentWallet, toAddress, value, setValue, setLoading, setLoaderMessage, setSecondaryMessage, setSuccess)
            ): (tokenType1 === "LP Token") && (tokenType2 === "Token") && (toName === "ETH") ? (
            swapPairForETH(currentWallet, fromAddress, tokenAbi, value, setValue, setLoading, setLoaderMessage, setSecondaryMessage, setSuccess)
            ): (tokenType1 === "Token") && (tokenType2 === "Token") && (toName === "ETH") ? (
            swapTokenForETH(currentWallet, fromAddress, tokenAbi, value, setValue, setLoading, setLoaderMessage, setSecondaryMessage, setSuccess)
            ):(
            swapPairForPair(currentWallet, fromAddress, toAddress, tokenAbi, value, setValue, setLoading, setLoaderMessage, setSecondaryMessage, setSuccess)
            )
          }}
          
        /> 
      )}
    </div>
  );
}

export default Exchange;
