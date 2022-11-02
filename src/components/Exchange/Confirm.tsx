import React, {useRef} from 'react';
import {BsArrowDown} from "react-icons/bs";
import {GrClose} from "react-icons/gr"; 
import './Confirm.css';

function Confirm({lightMode, setConfirmPage, amount, toAmount, fromName, toName, fromImg, toImg, fromAlt, toAlt, swap}: any) {

  // close the modal when clicking outside the modal.
  const modalRef: any = useRef();

  const closeModal = (e: any) => {
    if (e.target === modalRef.current) {
      setConfirmPage(false);
    }
  };


  return (
    <div className={`confirm_page ${lightMode && 'confirm_page--light'}`} ref={modalRef} onClick={closeModal}>

      <div className={`confirm_modal ${lightMode && 'confirm_modal--light'}`}>

        <div className={`confirmation_header`}>  

          <div className={`confirm_title ${lightMode && 'confirm_title--light'}`}>
            Confirm Transaction
          </div>

          <div className={`confirmation_close`} onClick={() => setConfirmPage(false)}>
            <GrClose />
          </div>
          

        </div>


        <div className={`confirmation_block ${lightMode && 'confirmation_block--light'}`}>

          <div className={`confirmation_logo_container`}>
            <img className={`confirmation_logo`} src={fromImg} alt={fromAlt}/>
            <img className={`confirmation_logo`} src={toImg}  alt={toAlt}/>
          </div>


          
          <div className={`transaction_details ${lightMode && 'transaction_details--light'}`}>
            Swap {amount} {fromName}
          </div>

          <div className={`confirm_arrow ${lightMode && 'confirm_arrow--light'}`}>
            <BsArrowDown />
          </div>

          <div className={`confirm_retrieve ${lightMode && 'confirm_retrieve--light'}`}>
          {toAmount} {toName}
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