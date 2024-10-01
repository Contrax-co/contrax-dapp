import { FC, useState } from "react";
import { ModalLayout } from "../ModalLayout/ModalLayout";
import styles from "./WalletConnectionModal.module.scss";
import useWallet from "src/hooks/useWallet";
import { BeatLoader } from "react-spinners";
import { IoArrowForward } from "react-icons/io5";
import { BsShieldFillCheck } from "react-icons/bs";

interface IProps {
    setOpenModal: Function;
}

export const WalletConnectionModal: FC<IProps> = ({ setOpenModal }) => {
    const { alchemySigner, connectWallet } = useWallet();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [showViewEmail, setShowViewEmail] = useState(false);
    const loginWithEmail = async () => {
        const match = String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
        if (!match) return;
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setShowViewEmail(true);
        }, 3000);
        await alchemySigner!.authenticate({ type: "email", email }).catch((err) => console.warn(err));
    };

    const loginWithPasskey = async () => {
        setLoading(true);
        try {
            await alchemySigner!.authenticate({ type: "passkey", createNew: false });
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
            await alchemySigner!.authenticate({
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
            <BsShieldFillCheck className={styles.warning} size={1} />
            <h1 className={styles.heading}>Get Started</h1>
            {showViewEmail && !loading && (
                <div className="center" style={{ height: "180px" }}>
                    <p className={styles.caption}>View your Email for login link.</p>
                </div>
            )}
            {!showViewEmail && !loading && (
                <div>
                    <p className={styles.caption}>Continue with Email</p>
                    <div style={{ display: "flex", marginTop: 20, gap: 10 }}>
                        <div className={styles.inputContainer}>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className={styles.input}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <button onClick={loginWithEmail} className={"custom-button center " + styles.loginBtn}>
                            <IoArrowForward fontSize={20} />
                        </button>
                    </div>
                    <p className={styles.caption} style={{ marginTop: 20 }}>
                        OR Passkeys
                    </p>
                    <div className={styles.passkeyBtnsContainer}>
                        <button onClick={loginWithPasskey} className={"custom-button " + styles.passkeyBtn}>
                            Sign In
                        </button>

                        <button onClick={signUpWithPasskey} className={"custom-button " + styles.passkeyBtn}>
                            Sign Up
                        </button>
                    </div>
                    {window.ethereum && (
                        <div>
                            <div className={styles.walletDivider} />
                            <button
                                className={"custom-button " + styles.injectedBtn}
                                onClick={connectWithInjectedWallet}
                            >
                                Continue with wallet
                            </button>
                        </div>
                    )}
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
