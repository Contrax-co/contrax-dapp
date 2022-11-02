import { useState, useEffect } from 'react';
import {CgArrowsExchangeAltV} from 'react-icons/cg';
import SwapValuesFrom from './from/SwapValuesFrom';
import SwapValuesTo from './to/SwapValuesTo';
import { MoonLoader } from 'react-spinners';
import './Exchange.css';
import From from './from/From';
import To from './to/To';
import { swapFromTokenToPair, swapFromTokenToToken, 
  swapPairForPair, swapPairForToken
} from './exchange-functions';
import Confirm from './Confirm';

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


  useEffect(() => {
    fetch('http://localhost:3000/api/poolswap.json') //`http://localhost:3000/api/pools.json` or `https://testing.contrax.finance/api/pools.json` for when we want it done locally
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
              value={value}
              fromAddress = {fromAddress}
              toAddress={toAddress}
              setToValue={setToValue}
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
            fromAddress = {fromAddress}
            toAddress = {toAddress}
            setValue = {setValue}
          />

        </div>
        
        {(tokenType1 === "Token") && (tokenType2 === "Token")? (
          <div className={`exchange_button ${lightMode && 'exchange_button--light'}`} onClick={() => {
          setConfirmPage(true)
          swapFromTokenToToken(currentWallet, value, fromAddress, toAddress, setValue, tokenAbi, setLoading, setLoaderMessage, setSecondaryMessage)
          }}>
           
            {value ? (
              <p>Swap</p>
            ): (
              <p>Enter a amount</p>
            )}

          </div>
         
        ) : (tokenType1 === "Token") && (tokenType2 === "LP Token") ? (
          <div className={`exchange_button ${lightMode && 'exchange_button--light'}`} onClick={() => swapFromTokenToPair(currentWallet, fromAddress, toAddress, tokenAbi, value, setValue, setLoading, setLoaderMessage, setSecondaryMessage)}>
           
            {value ? (
              <p>Swap</p>
            ): (
              <p>Enter a amount</p>
            )}

          </div>
        ): (tokenType1 === "LP Token") && (tokenType2 === "Token") ? (
          <div className={`exchange_button ${lightMode && 'exchange_button--light'}`} onClick={() => swapPairForToken(currentWallet, fromAddress, toAddress, tokenAbi, value, setValue, setLoading, setLoaderMessage, setSecondaryMessage)}>
           
            {value ? (
              <p>Swap</p>
            ): (
              <p>Enter a amount</p>
            )}

          </div>
        ): (
          <div className={`exchange_button ${lightMode && 'exchange_button--light'}`} onClick={() => swapPairForPair(currentWallet, fromAddress, toAddress, tokenAbi, value, setValue, setLoading, setLoaderMessage, setSecondaryMessage)}>
           
            {value ? (
              <p>Swap</p>
            ): (
              <p>Enter a amount</p>
            )}

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
            <MoonLoader size={20} loading={isLoading} color={'rgb(89, 179, 247)'}/> 
            </div>

              <div className={`exchange_spinner_right`}>
                <p style={{fontWeight:'700'}}>{loaderMessage}</p>
                <p style={{fontSize:'13px'}}>{secondaryMessage}</p>
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
        /> 
      )}
    </div>
  );
}

export default Exchange;
