import { FC } from "react";
import useApp from "src/hooks/useApp";
import styles from "./SlippageWarning.module.scss";
import { ModalLayout } from "../ModalLayout/ModalLayout";

interface IProps {
    handleClose: Function;
}
export const SlippageWarning: FC<IProps> = ({ handleClose }) => {
    const { lightMode } = useApp();

    return (
        <ModalLayout onClose={handleClose}>
            <div className={styles.container}>
                <h1>High Slippage!</h1>
            </div>
        </ModalLayout>
    );
};
