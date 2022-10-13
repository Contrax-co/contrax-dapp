import React, {useRef, useState} from 'react';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import {CgClose} from 'react-icons/cg';
import {FiExternalLink, FiCopy} from 'react-icons/fi';
import {BsCheckCircle} from 'react-icons/bs';
import './Logout.css';
import { removeUserSession } from '../../store/localStorage';

function Logout({lightMode, setLogout, currentWallet, setCurrentWallet}) {
    const [copied, setCopied] = useState(false);

    // close the modal when clicking outside the modal.
    const modalRef= useRef();

    const closeModal = (e) => {
        if (e.target === modalRef.current) {
            setLogout(false);
        }
    };

    const logout = async() => {
        removeUserSession(); 
        setCurrentWallet(''); 
        setLogout(false);
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(currentWallet);
        setCopied(true);

        setTimeout(() => {
            setCopied(false)
          }, 1000)
    }

  return (
    <div className="logout" ref={modalRef} onClick={closeModal}>
         <div className={`logout__modal ${lightMode && "logout__modal--light"}`}>
            <div className={`logout__info`}>
                <div className={`logout__close ${lightMode && "logout__close--light"}`}  onClick={() => setLogout(false)}>
                    { <CgClose  />}
                </div>

                <div className={`logout__icon`}>
                    <Jazzicon diameter={90} seed={jsNumberForAddress(currentWallet)}/>
                    <p className={`logout__address ${lightMode && "logout__address--light"}`}>{currentWallet.substring(0,6)}...{currentWallet.substring(currentWallet.length - 5)}</p>
                </div>

                {!copied ? (
                    <div className={`logout__copy ${lightMode && "logout__copy--light"}`} onClick={copyToClipboard}>
                        <FiCopy />
                        <p style={{marginLeft:"5px"}}>Copy Address</p>
                    </div>
                ): (
                    <div className={`logout__copy ${lightMode && "logout__copy--light"}`} onClick={copyToClipboard}>
                        <BsCheckCircle />
                        <p style={{marginLeft:"5px"}}>Copied</p>
                    </div> 
                )}

                
                <div className={`logout__arbiscan ${lightMode && "logout__arbiscan--light"}`} onClick={() => window.open(`https://arbiscan.io/address/${currentWallet}`, '_blank')}>
                   { <FiExternalLink />}
                    <p className="logout__view">View on Arbiscan</p>
                </div>

                <div className={`logout__button ${lightMode && "logout__button--light"}`} onClick={logout}>
                    <p>Logout</p>
                </div>

            </div>

        </div>
    </div>
  )
}

export default Logout