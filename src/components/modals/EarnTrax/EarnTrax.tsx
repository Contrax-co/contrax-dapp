import { FC, useState } from "react";
import { ModalLayout } from "../ModalLayout/ModalLayout";
import styles from "./EarnTrax.module.scss";
import { useAppDispatch } from "src/state";
import { acceptTerms, getMessage } from "src/api/trax";
import useWallet from "src/hooks/useWallet";
import { useSignMessage } from "wagmi";
import { setEarnTraxTermsAgreed } from "src/state/account/accountReducer";

interface IProps {
    setOpenModal: Function;
}

export const EarnTrax: FC<IProps> = ({ setOpenModal }) => {
    const dispatch = useAppDispatch();
    const { currentWallet } = useWallet();
    const { signMessageAsync } = useSignMessage();
    const [agree, setAgree] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleAgree = async () => {
        setIsLoading(true);
        const message = await getMessage();
        const signature = await signMessageAsync({ message });
        const termsAccepted = await acceptTerms(currentWallet, signature);
        dispatch(setEarnTraxTermsAgreed(termsAccepted));
        setIsLoading(false);
    };

    return (
        <ModalLayout onClose={() => setOpenModal(false)} className={styles.container}>
            <h2 className={styles.heading}>Terms & Conditions</h2>
            <p className={styles.description}>Agree to our terms and Earn TRAX tokens</p>
            <ul className={styles.terms}>
                <li>first term</li>
                <li>second term</li>
                <li>third term</li>
                <li>forth term</li>
                <li>fifth term</li>
                <li>
                    Lorem ipsum dolor, sit amet consectetur adipisicing elit. Officia corrupti, nulla quibusdam
                    obcaecati iusto quidem quam cumque odit deserunt unde ipsa tempora laborum esse alias ab
                    perspiciatis eveniet optio rerum.
                </li>
                <li>first term</li>
                <li>second term</li>
                <li>third term</li>
                <li>forth term</li>
                <li>fifth term</li>
                <li>first term</li>
                <li>second term</li>
                <li>third term</li>
                <li>forth term</li>
                <li>fifth term</li>
            </ul>
            <div className={styles.checkbox}>
                <input
                    type="checkbox"
                    name="agree"
                    id="agree"
                    checked={agree}
                    onChange={() => setAgree((prev) => !prev)}
                />
                <label htmlFor="agree">I agree all terms and conditions</label>
            </div>
            <div className={styles.buttonsContainer}>
                <button
                    className={"custom-button " + styles.cancelButton}
                    onClick={() => {
                        setOpenModal(false);
                    }}
                >
                    Cancel
                </button>
                <button className={"custom-button " + styles.agreeButton} disabled={!agree} onClick={handleAgree}>
                    {isLoading ? "l" : "Earn"}
                </button>
            </div>
        </ModalLayout>
    );
};
