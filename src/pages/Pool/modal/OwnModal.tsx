import { useRef } from "react";
import "./modal.css";

function OwnModals({
  lightMode,
  setOpenModal,
  tokens,
  setTokenId,
  setTokenSymbol,
}: any) {
  console.log(tokens);
  // close the modal when clicking outside the modal.
  const modalRef: any = useRef();

  const closeModal = (e: any) => {
    if (e.target === modalRef.current) {
      setOpenModal(false);
    }
  };

  const setId = (ids: any, symbol: any) => {
    setOpenModal(false);
    setTokenId(ids);
    setTokenSymbol(symbol);
  };

  return (
    <div className={`modal__containers`} ref={modalRef} onClick={closeModal}>
      <div className={`swap__modals ${lightMode && "swap__modal--lights"}`}>
        <div className={`modal__titles ${lightMode && "modal__title--lights"}`}>
          <p>Select Own token</p>
        </div>

        <div>
          {tokens.map((token: any) => (
            <div
              key={token.contract_address}
              className={`exchange_itemss ${
                lightMode && "exchange_itemss--light"
              }`}
              onClick={() => {
                setId(token.contract_address, token.contract_ticker_symbol);
              }}
            >
              <div
                className={`pad_optionss ${lightMode && "pad_options--lights"}`}
              >
                <p>{token.contract_name}</p>
                <p className="mini">{token.contract_ticker_symbol}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default OwnModals;
