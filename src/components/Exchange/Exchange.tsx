import { useState, useEffect } from 'react';
import { CgArrowsExchangeAltV } from 'react-icons/cg';
import SwapValuesFrom from './SwapValuesFrom';
import SwapValuesTo from './SwapValuesTo';
import './Exchange.css';
import From from './From';
import To from './To';

function Exchange({ lightMode }: any) {
  const [openModalFrom, setOpenModalFrom] = useState(false);
  const [openModalTo, setOpenModalTo] = useState(false);


  const[tokenId1, setTokenId1] = useState(1);
  const[tokenId2, setTokenId2] = useState(1);
  const [tokens, setTokens] = useState([]);

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

      <div
        className={`swap__container ${lightMode && 'swap__container--light'}`}
      >
        <p className={`swap_title ${lightMode && 'swap_title--light'}`}>Swap</p>

        <div className={`from ${lightMode && 'from--light'}`}>
          
            <From 
              lightMode={lightMode}
              setOpenModal={setOpenModalFrom}
              tokens = {tokens}
              tokenId = {tokenId1}
            /> 

        </div>

        <CgArrowsExchangeAltV
          className={`symbol__exchange ${
            lightMode && 'symbol__exchange--light'
          }`}
        />

        <div className={`to ${lightMode && 'to--light'}`}>

          <To 
            lightMode={lightMode}
            setOpenModal={setOpenModalTo}
            tokens = {tokens}
            tokenId={tokenId2}
          />

        </div>

        <div
          className={`exchange_button ${lightMode && 'exchange_button--light'}`}
        >
          <p>Enter a amount</p>
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
