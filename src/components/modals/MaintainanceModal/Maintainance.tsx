import { FC } from "react";
import { ModalLayout } from "../ModalLayout/ModalLayout";
import { TiWarningOutline } from "react-icons/ti";
import styles from "./Maintainance.module.scss";
import logo from "src/assets/images/logo.png";
import logo2 from "src/assets/images/logo-4x.png";
import useApp from "src/hooks/useApp";

export const Maintainance: FC = () => {
    const { lightMode } = useApp();
    return (
        <ModalLayout onClose={() => {}} className={styles.container}>
            <img className={styles.logo} alt="contrax-logo" src={lightMode ? logo2 : logo} />
            <h2 className={styles.heading}>Under Maintenance</h2>
            <p className={styles.caption}>
                Your tokens and stake positions will be visible soon. You can always withdraw them from the blockchain
                directly.
            </p>
        </ModalLayout>
    );
};
