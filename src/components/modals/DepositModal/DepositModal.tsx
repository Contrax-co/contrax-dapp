import { FC, useEffect, useMemo, useState } from "react";
import styles from "./DepositModal.module.scss";
import { ModalLayout } from "../ModalLayout/ModalLayout";
import useFarmDetails from "src/hooks/farms/useFarmDetails";
import { getCombinedBalance, toEth, toWei } from "src/utils/common";
import useBalances from "src/hooks/useBalances";
import useFarms from "src/hooks/farms/useFarms";
import { CHAIN_ID } from "src/types/enums";
import usePriceOfTokens from "src/hooks/usePriceOfTokens";
import { zeroAddress } from "viem";
import { getBalance } from "src/api/token";
import { addressesByChainId } from "src/config/constants/contracts";
import useWallet from "src/hooks/useWallet";
import { notifyError } from "src/api/notify";

interface IProps {
    handleClose: Function;
    handleSubmit: (x: { bridgeChainId?: number }) => Promise<void>;
    farmId: number;
    inputAmount: number;
    symbol: "usdc" | "native";
}
const DepositModal: FC<IProps> = ({ handleClose, handleSubmit, farmId, inputAmount, symbol }) => {
    // const { farmDetails } = useFarmDetails();
    const { getPublicClient, currentWallet } = useWallet();
    const { farms } = useFarms();
    const { prices } = usePriceOfTokens();
    const farm = farms.find((item) => item.id === farmId)!;
    const { balances } = useBalances();
    const combined = useMemo(() => getCombinedBalance(balances, farm.chainId, symbol), [balances, symbol]);
    const [checkedNetwork, setCheckedNetwork] = useState<string>();

    const handleCheckboxClick = (chainId: string) => {
        if (chainId === farm.chainId.toString()) return;
        if (checkedNetwork === farm.chainId.toString()) return;
        const totalSelectedBalanceRaw = combined.chainBalances[chainId] + combined.chainBalances[farm.chainId];
        const selectedTotalBalance = Number(toEth(totalSelectedBalanceRaw, symbol === "usdc" ? 6 : 18));
        if (selectedTotalBalance < inputAmount) {
            notifyError({ message: "Insufficient Balance", title: "Cannot Select Chain" });
            return;
        }

        setCheckedNetwork(chainId);
    };

    useEffect(() => {
        (async function () {
            if (!currentWallet) return;
            const toBal = await getBalance(
                symbol === "usdc" ? addressesByChainId[farm.chainId].nativeUsdAddress! : zeroAddress,
                currentWallet,
                { public: getPublicClient(farm.chainId) }
            );
            const toBalDiff = toWei(inputAmount, symbol === "usdc" ? 6 : 18) - toBal;
            if (toBalDiff <= 0) {
                setCheckedNetwork(farm.chainId.toString());
                return;
            }
            const fromChainId: number | undefined = Number(
                Object.entries(combined.chainBalances).find(([key, value]) => {
                    if (value >= toBalDiff && Number(key) !== farm.chainId) return true;
                    return false;
                })?.[0]
            );
            setCheckedNetwork(fromChainId?.toString());
        })();
    }, [combined, currentWallet]);

    return (
        <ModalLayout onClose={handleClose} className={styles.modal}>
            <div className={styles.container}>
                <h2 style={{ fontWeight: 600 }}>
                    Confirm Zap (
                    {(inputAmount * (symbol === "usdc" ? 1 : prices[farm.chainId][zeroAddress])).toLocaleString()}$ )
                </h2>
                {/* <p style={{ color: `var(--color_grey)` }}>{`Please review the deposit process and confirm.`}</p> */}
                <p style={{ color: `var(--color_grey)` }}>You can change the network to deposit usdc from</p>

                <div style={{ marginTop: 10 }}>
                    {Object.entries(combined.chainBalances)
                        .sort((a, b) => (a[0] === farm.chainId.toString() ? -1 : 0))
                        .map(([key, value]) => (
                            <div key={key} style={{ display: "flex", gap: 20 }}>
                                <input
                                    type="checkbox"
                                    checked={key === farm.chainId.toString() || checkedNetwork === key}
                                    disabled={key === farm.chainId.toString()}
                                    onClick={() => handleCheckboxClick(key)}
                                />
                                <p>
                                    {
                                        Object.entries(CHAIN_ID).find(
                                            (item) => item[1].toString() === key.toString()
                                        )?.[0]
                                    }
                                </p>
                                <p>
                                    {(
                                        Number(toEth(value, symbol === "usdc" ? 6 : 18)) *
                                        (symbol === "usdc" ? 1 : prices[key as any][zeroAddress])
                                    ).toLocaleString()}{" "}
                                    $
                                </p>
                            </div>
                        ))}
                </div>
                <div className={styles.buttonContainer}>
                    <button
                        className={`custom-button ${styles.cancelButton}`}
                        onClick={() => {
                            handleClose();
                        }}
                    >
                        Close
                    </button>
                    <button
                        className={`custom-button ${styles.continueButton}`}
                        onClick={() => {
                            handleSubmit({ bridgeChainId: Number(checkedNetwork) });
                            handleClose();
                        }}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </ModalLayout>
    );
};

export default DepositModal;
