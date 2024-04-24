import { FC, useState } from "react";
import { ModalLayout } from "../ModalLayout/ModalLayout";
import styles from "./EarnTrax.module.scss";
import { useAppDispatch } from "src/state";
import { acceptTerms, getMessage } from "src/api/trax";
import useWallet from "src/hooks/useWallet";
import { setEarnTraxTermsAgreed } from "src/state/account/accountReducer";
import { ImSpinner8 } from "react-icons/im";

interface IProps {
    setOpenModal: Function;
    setCongModal: Function;
}

export const EarnTrax: FC<IProps> = ({ setOpenModal, setCongModal }) => {
    const dispatch = useAppDispatch();
    const { currentWallet, client } = useWallet();
    const [agree, setAgree] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleAgree = async () => {
        if (!client.wallet || !currentWallet) return;
        setIsLoading(true);
        const message = await getMessage();
        const signature = await client.wallet.signMessage({ message });
        const termsAccepted = await acceptTerms(currentWallet, signature);
        setCongModal(true);
        dispatch(setEarnTraxTermsAgreed(termsAccepted));
        setIsLoading(false);
    };

    return (
        <ModalLayout onClose={() => setOpenModal(false)} className={styles.container}>
            <h2 className={styles.heading}>xTRAX Token Terms of Use</h2>
            <p className={styles.description}>Agree to our terms and Earn xTRAX tokens</p>
            <p className={styles.description}>Effective Date: 08/21/2023</p>
            <div className={styles.terms}>
                These TRAX Token Terms of Use (the "Terms") govern your receipt and use of the xTRAX token ("xTRAX" or
                "Token") issued by Contrax DAO LLC ("Contrax DAO," "we," "us," or "our"). By accessing, staking,
                holding, or using TRAX in any manner (“Use”), you acknowledge that you have read, understood, and agree
                to be bound by these Terms and the Operating Agreement of Contrax DAO. They are in addition to the
                website terms and conditions, which you also affirming you agree in these terms. The website terms and
                conditions can be found{" "}
                <a href="termsofuse.pdf" target="_blank">
                    here.
                </a>
                <ol>
                    <li>
                        <b>xTRAX Governance Token:</b>
                        <br /> xTRAX is a digital token created and issued by Contrax DAO. It is intended to serve as a
                        membership interest in Contrax DAO and a governance token within the Contrax DAO ecosystem once
                        the governance model and voting mechanisms are complete and operational. xTRAX is designed to
                        represent membership rights and the ability to participate in the decision-making processes of
                        Contrax DAO in the future.
                        <ol>
                            <li>
                                <b>Non-Transferability:</b>
                                <br />
                                At present, xTRAX is non-transferable. This means that you may not transfer, sell,
                                exchange, or otherwise dispose of your xTRAX to other parties. However, Contrax DAO
                                retains the right, at its sole discretion, to enable token transfers in the future.
                            </li>
                            <li>
                                <b>Voting Rights:</b>
                                <br />
                                xTRAX is intended to give its holder voting rights within the governance framework of
                                Contrax DAO, subject to the Operating Agreement of Contrax DAO. These voting rights are
                                designed to allow you to participate in key decisions that impact the development and
                                direction of the Contrax platform once the governance model and mechanism of voting are
                                complete and operational.
                            </li>
                        </ol>
                    </li>
                    <li>
                        <b>Emission Rate and Token Usage:</b>
                        <ol>
                            <li>
                                <b>Emission Rate:</b>
                                <br />
                                xTRAX emission is a mechanism by which new tokens are created and distributed to users
                                who stake their crypto assets on the Contrax platform. The current emission rate is set
                                at 1 xTRAX for every $50 staked per day per 10% APY. This emission rate is subject to
                                change at any time at the discretion of Contrax DAO.
                            </li>
                            <li>
                                <b>Purpose of Emission:</b>
                                <br />
                                The emission of xTRAX tokens is designed to reward users for their participation and
                                usage of the Contrax platform. It is important to note that xTRAX emission is not an
                                endorsement of any particular platform or pool. It applies uniformly to all staking
                                pools within the Contrax platform.
                            </li>

                            <li>
                                <b>No Intrinsic Value:</b>
                                <br />
                                xTRAX is not designed to have any intrinsic value, or value outside the Contrax DAO
                                ecosystem. xTRAX is not intended to serve as a speculative investment or a vehicle for
                                generating financial returns. It is specifically designed as a representation of voting
                                right units for governance purposes within Contrax DAO.
                            </li>

                            <li>
                                <b>Limitation of Liability:</b>
                                <br />
                                Your use of xTRAX is entirely at your own risk. To the fullest extent permitted by law,
                                Contrax DAO shall not be liable for any direct, indirect, incidental, special,
                                consequential, or exemplary damages arising from your use of xTRAX, including but not
                                limited to losses of profits, goodwill, data, or other intangible losses. Under no
                                circumstances shall the aggregate liability of Contrax DAO exceed $100.
                            </li>

                            <li>
                                <b>Release of Claims:</b>
                                <br />
                                By your continuous Use of xTRAX, you each time voluntarily release Contrax DAO, its
                                affiliates, directors, officers, employees, agents, and representatives, of any claims
                                that relate to xTRAX, your Use of it, and the Contrax platform, and waive any right to
                                bring a lawsuit.
                            </li>

                            <li>
                                <b>Binding Arbitration:</b>
                                <br />
                                Any dispute, claim, or controversy arising from or related to these Terms or the Use of
                                xTRAX shall be resolved exclusively through binding arbitration. The arbitration shall
                                take place in New York, NY and shall be conducted in the English language in accordance
                                with the rules of the American Arbitration Association.
                            </li>

                            <li>
                                <b>Modification of Terms:</b>
                                <br />
                                Contrax DAO reserves the right to modify, suspend, or terminate these Terms, the
                                functionality of xTRAX or any aspect of the Contrax platform at its sole discretion. Any
                                material changes to these Terms will be communicated through Contrax DAO’s website or
                                other official Contrax DAO channels. You are responsible for monitoring such sites for
                                any updates. By continuing to Use TRAX, you acknowledge and agree to the then-applicable
                                Terms.
                            </li>

                            <li>
                                <b>Governing Law:</b>
                                <br />
                                These Terms shall be governed by and construed in accordance with the laws of the state
                                of Wyoming, without regard to its conflict of law principles.
                            </li>

                            <li>
                                <b>Entire Agreement:</b>
                                <br />
                                These Terms constitute the entire agreement between you and Contrax DAO regarding xTRAX
                                and supersede all prior agreements and understandings, whether oral or written.
                            </li>
                        </ol>
                    </li>
                </ol>
                If you do not agree with these Terms, you should not Use xTRAX, nor participate in Contrax DAO's
                governance activities.
            </div>
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
                    className={"custom-button " + styles.agreeButton}
                    disabled={!agree || isLoading}
                    onClick={handleAgree}
                >
                    {isLoading ? <ImSpinner8 className={styles.loader} /> : "Earn"}
                </button>
            </div>
        </ModalLayout>
    );
};
