import { FC } from "react";
import { ModalLayout } from "../ModalLayout/ModalLayout";
import styles from "./WalletList.module.scss";
import { useConnect, useConnectors } from "wagmi";

interface IProps {
    setOpenModal: Function;
}

const WalletList: FC<IProps> = ({ setOpenModal }) => {
    const connectors = useConnectors();
    const { connectAsync } = useConnect();

    return (
        <ModalLayout onClose={() => setOpenModal(false)} className={styles.container}>
            <h1>Wallet List</h1>
            {connectors.map((item) => (
                <p key={item.id} onClick={() => connectAsync({ connector: item })}>
                    {item.name}
                </p>
            ))}
        </ModalLayout>
    );
};

export default WalletList;
