import { useState, useEffect } from 'react';
import {CgArrowsExchangeAltV} from 'react-icons/cg';
import SwapValuesFrom from './from/SwapValuesFrom';
import SwapValuesTo from './to/SwapValuesTo';
import './Exchange.css';
import From from './from/From';
import To from './to/To';
import { swapFromTokenToToken } from './exchange-functions';

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

  const [fromAbi, setFromAbi] = useState({}); 

  useEffect(() => {
    fetch('http://localhost:3000/api/poolswap.json') //`http://localhost:3000/api/pools.json` or `https://testing.contrax.finance/api/pools.json` for when we want it done locally
      .then((response) => response.json())
      .then((data) => {
        setTokens(data);
      });
  }, []);

  useEffect(() =>{
    console.log(`the from address is ${fromAddress}`);
    console.log(`the to address is ${toAddress}`);

    console.log(`the value to be swapped is ${value}`);
  })

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
              setFromAbi = {setFromAbi}
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
          />

        </div>

        <div
          className={`exchange_button ${lightMode && 'exchange_button--light'}`}
          onClick={() => swapFromTokenToToken(currentWallet, value, fromAddress, toAddress, setValue)}
        >
          {value ? (
            <p>Swap</p>
          ): (
            <p>Enter a amount</p>
          )}
          
        </div>
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
    </div>
  );
}

export default Exchange;
