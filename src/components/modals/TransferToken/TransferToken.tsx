import { FC, useState } from "react";
import useApp from "src/hooks/useApp";
import { Address } from "wagmi";
import styles from "./TransferToken.module.scss";
export const TransferToken: FC = () => {
    const { lightMode } = useApp();
    const [reciverAddress, setReciverAddress] = useState<string>();
    return (
        <div className={styles.backdrop}>
            <div className={styles.container}>
                <h1 className={styles.heading}>Transfer Token</h1>
                <form className={styles.transferForm}>
                    <div className="token-rows token-column">
                        <label htmlFor="reciverAddress" className="token-label">
                            Send To:
                        </label>
                        <input
                            className={`token-inputs ${lightMode && "token-inputs-light"}`}
                            type="text"
                            id="reciverAddress"
                            placeholder="e.g. 0xA3KL3QKTIP34LKJ45MSD43KL35K34M34LKJ45MSD"
                            onChange={(e) => setReciverAddress(e.target.value)}
                        />
                    </div>
                    <div className="token-rows token-column">
                        <label htmlFor="reciverAddress" className="token-label">
                            Amount:
                        </label>
                        <input
                            className={`token-inputs ${lightMode && "token-inputs-light"}`}
                            type="text"
                            id="reciverAddress"
                            placeholder="e.g. 0xA3KL3QKTIP34LKJ45MSD43KL35K34M34LKJ45MSD"
                            onChange={(e) => setReciverAddress(e.target.value)}
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};
