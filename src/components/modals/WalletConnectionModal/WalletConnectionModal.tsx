import { FC, useEffect, useState } from "react";
import { ModalLayout } from "../ModalLayout/ModalLayout";
import styles from "./WalletConnectionModal.module.scss";
import useWallet from "src/hooks/useWallet";
import { BeatLoader } from "react-spinners";
import { createWalletClient, custom } from "viem";
import { arbitrum } from "viem/chains";

interface IProps {
    setOpenModal: Function;
}

export const WalletConnectionModal: FC<IProps> = ({ setOpenModal }) => {
    const { alchemySigner, connectWallet } = useWallet();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [showViewEmail, setShowViewEmail] = useState(false);
    const loginWithEmail = () => {
        alchemySigner.authenticate({ type: "email", email });
        setShowViewEmail(true);
    };

    const loginWithPasskey = async () => {
        setLoading(true);
        try {
            await alchemySigner.authenticate({ type: "passkey", createNew: false });
            await connectWallet();
            setOpenModal(false);
        } catch (error) {
            alert("No Passket Detected.");
        }
        setLoading(false);
    };
    const signUpWithPasskey = async () => {
        setLoading(true);
        try {
            await alchemySigner.authenticate({
                type: "passkey",
                createNew: true,
                username: "contrax_finance_passkey",
            });
            await connectWallet();
            setOpenModal(false);
        } catch (err) {
            console.error(err);
            alert("Something went wrong!");
        }
        setLoading(false);
    };

    const connectWithInjectedWallet = async () => {
        setLoading(true);
        try {
            await connectWallet(true);

            setOpenModal(false);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    return (
        <ModalLayout onClose={() => setOpenModal(false)} className={styles.container}>
            {showViewEmail && !loading && (
                <div className="center" style={{ height: "180px" }}>
                    <p>View your Email for login link.</p>
                </div>
            )}
            {!showViewEmail && !loading && (
                <div>
                    <p>Email:</p>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                    <button onClick={loginWithEmail}>Log In</button>
                    <h6>OR</h6>
                    {window.ethereum && <button onClick={connectWithInjectedWallet}>Connection with wallet</button>}
                    <button onClick={loginWithPasskey}>Sign in with passkey</button>
                    <button onClick={signUpWithPasskey}>Sign up with passkey</button>
                </div>
            )}
            {loading && (
                <div className="center" style={{ height: "200px" }}>
                    <BeatLoader />
                </div>
            )}
        </ModalLayout>
    );
};
