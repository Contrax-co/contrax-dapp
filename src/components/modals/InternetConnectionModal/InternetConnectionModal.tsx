import { FC } from "react";
import { ModalLayout } from "../ModalLayout/ModalLayout";
import styles from "./InternetConnectionModal.module.scss";
import logo from "src/assets/images/logo.png";
import logo2 from "src/assets/images/logo-4x.png";
import useApp from "src/hooks/useApp";

export const InternetConnectionModal: FC = () => {
    const { lightMode } = useApp();
    return (
        <ModalLayout onClose={() => {}} className={styles.container}>
            <img className={styles.logo} alt="contrax-logo" src={lightMode ? logo2 : logo} />
            <h2 className={styles.heading}>Internet Not Connected</h2>
            <p className={styles.caption}>
                Your internet is not connected. Try to connect to an internet network to use Contrax features.
            </p>
        </ModalLayout>
    );
};
