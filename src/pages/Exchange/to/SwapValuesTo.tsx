import { useRef } from "react";
import useApp from "src/hooks/useApp";
import "./SwapValuesTo.css";

function SwapValuesTo({ setOpenModal, tokens, setTokenId }: any) {
    const { lightMode } = useApp();
    // close the modal when clicking outside the modal.
    const modalRef: any = useRef();

    const closeModal = (e: any) => {
        if (e.target === modalRef.current) {
            setOpenModal(false);
        }
    };

    const setId = (ids: any) => {
        setOpenModal(false);
        setTokenId(ids);
    };

    return (
        <div className={`modal__container`} ref={modalRef} onClick={closeModal}>
            <div className={`swap__modal ${lightMode && "swap__modal--light"}`}>
                <div className={`modal__title ${lightMode && "modal__title--light"}`}>
                    <p>Select a token</p>
                </div>

                <div>
                    {tokens.map((token: any) => (
                        <div
                            key={token.id}
                            className={`exchange_items ${lightMode && "exchange_items--light"}`}
                            onClick={() => {
                                setId(token.id);
                            }}
                        >
                            <div className={`pad_options ${lightMode && "pad_options--light"}`}>
                                <img alt={token.token_alt} className={`exchange__logo2`} src={token.token_logo} />
                                <p>{token.token_name}</p>
                                <p className="mini">{token.token_sub}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default SwapValuesTo;
