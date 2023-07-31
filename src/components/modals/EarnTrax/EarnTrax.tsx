import { FC, useState } from "react";
import { ModalLayout } from "../ModalLayout/ModalLayout";
import styles from "./EarnTrax.module.scss";
import { useAppDispatch } from "src/state";
import { setEarnTrax } from "src/state/settings/settingsReducer";

interface IProps {
    setOpenModal: Function;
}

export const EarnTrax: FC<IProps> = ({ setOpenModal }) => {
    const dispatch = useAppDispatch();
    const [agree, setAgree] = useState(false);

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
                <button
                    className="custom-button"
                    disabled={!agree}
                    onClick={() => {
                        dispatch(setEarnTrax(true));
                    }}
                >
                    Earn
                </button>
            </div>
        </ModalLayout>
    );
};
