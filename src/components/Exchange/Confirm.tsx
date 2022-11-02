import React, {useRef} from 'react';
import './Confirm.css';

function Confirm({lightMode, setConfirmPage}: any) {

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
        Confirm Transaction 
      </div>
      
    </div>
  )
}

export default Confirm