import React, {useRef} from 'react';
import './SwapValues.css';

function SwapValues({lightMode, setOpenModal, tokens, setTokenSwap}) {
    // close the modal when clicking outside the modal.
    const modalRef = useRef();

    const closeModal = (e) => {
        if (e.target === modalRef.current) {
            setOpenModal(false);
        }
    };


  return (
    <div className={`modal__container`} ref={modalRef} onClick={closeModal}>
        <div className={`swap__modal ${lightMode && "swap__modal--light"}`}>
            <div className={`modal__title ${lightMode && "modal__title--light"}`}>
                <p>Select a token</p>
            </div>

            <div>
                {tokens.map((token) => (
                    <div key={token.id} className={`exchange_items ${lightMode && "exchange_items--light"}`} onClick={() => {
                        setOpenModal(false); 
                        setTokenSwap(token.id);
                    }}>
                        {token.token_sub !== "LP Token" ? (
                            <div className={`pad_options ${lightMode && "pad_options--light"}`}>
                                <img alt={token.token_alt2} className={`exchange__logo2 ${lightMode && "exchange__logo2--light"}`} src={token.token_logo2}/> 
                                <p>{token.token_name}</p>
                                <p className="mini">{token.token_sub}</p>
                            </div>
                            
                        ): (

                            <div className={`pad_options ${lightMode && "pad_options--light"}`}>
                                <img alt={token.token_alt1} className={`exchange__logo1 ${lightMode && "exchange__logo1--light"}`} src={token.token_logo1}/> 
                                <img alt={token.token_alt2} className={`exchange__logo2 ${lightMode && "exchange__logo2--light"}`} src={token.token_logo2}/>
                                <p>{token.token_name}</p>
                                <p className="mini">{token.token_sub}</p>
                            </div>

                        )}

                    </div>

                ))}
            </div>
        
            
        </div>
    
    </div>
  )
}

export default SwapValues