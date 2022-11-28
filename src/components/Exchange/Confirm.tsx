import React, {useRef, useState, useEffect} from 'react';
import {BsArrowDown} from "react-icons/bs";
import {IoMdClose} from "react-icons/io"; 
import { priceToken } from './confirm-functions';
import './Confirm.css';

function Confirm({
  lightMode, setConfirmPage, amount, toAmount, 
  fromName, toName, fromImg, toImg, fromAlt, toAlt, 
  swap, fromAddress, toAddress
}: any) {

  const [fromPrice, setFromPrice] = useState(0);
  const [toPrice, setToPrice] = useState(0);

  // close the modal when clicking outside the modal.
  const modalRef: any = useRef();

  const closeModal = (e: any) => {
    if (e.target === modalRef.current) {
      setConfirmPage(false);
    }
  };

  useEffect(() => {
    priceToken(fromAddress, setFromPrice);
    priceToken(toAddress, setToPrice);

  }, [fromAddress, toAddress])


  return (
    <div className={`confirm_page ${lightMode && 'confirm_page--light'}`} ref={modalRef} onClick={closeModal}>

      <div className={`confirm_modal ${lightMode && 'confirm_modal--light'}`}>

        <div className={`confirmation_header`}>  

          <div className={`confirm_title ${lightMode && 'confirm_title--light'}`}>
            Confirm Transaction
          </div>

          <div className={`confirmation_close ${lightMode && 'confirmation_close--light'}`} onClick={() => setConfirmPage(false)}>
            <IoMdClose />
          </div>
          

        </div>


        <div className={`confirmation_block ${lightMode && 'confirmation_block--light'}`}>

          <div className={`confirmation_logo_container`}>
            <img className={`confirmation_logo`} src={fromImg} alt={fromAlt}/>
            <img className={`confirmation_logo`} src={toImg}  alt={toAlt}/>
          </div>


          
          <div className={`transaction_details ${lightMode && 'transaction_details--light'}`}>
            <p className={`transaction_value ${lightMode && 'transaction_value--light'}`}>Swap {amount} {fromName}</p>
            <p className={`transaction_usd ${lightMode && 'transaction_usd--light'}`}>{(amount * fromPrice).toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
              })}</p>
          </div>

          <div className={`confirm_arrow ${lightMode && 'confirm_arrow--light'}`}>
            <BsArrowDown />
          </div>

          <div className={`transaction_details ${lightMode && 'transaction_details--light'}`}>
          <p className={`transaction_value ${lightMode && 'transaction_value--light'}`}>{toAmount.toFixed(4)} {toName}</p>
          <p className={`transaction_usd ${lightMode && 'transaction_usd--light'}`}>{(toAmount * toPrice).toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
              })}</p>
          </div>

        </div>


        <div className={`confirmation_button ${lightMode && 'confirmation_button--light'}`}>
          
          <div className={`button_container ${lightMode && 'button_container--light'}`} onClick={() => {
            swap()
            setConfirmPage(false)
            }}>
            <p>Confirm Swap</p>
          </div>
          
        </div>

      </div>
      
    </div>
  )
}

export default Confirm