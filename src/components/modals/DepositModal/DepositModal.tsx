import { FC, useEffect, useMemo, useState } from "react";
import styles from "./DepositModal.module.scss";
import { ModalLayout } from "../ModalLayout/ModalLayout";
import useFarmDetails from "src/hooks/farms/useFarmDetails";
import { getCombinedBalance, toEth, toWei } from "src/utils/common";
import useBalances from "src/hooks/useBalances";
import useFarms from "src/hooks/farms/useFarms";
import { CHAIN_ID } from "src/types/enums";
import usePriceOfTokens from "src/hooks/usePriceOfTokens";
import { Address, zeroAddress } from "viem";
import { getBalance } from "src/api/token";
import { addressesByChainId } from "src/config/constants/contracts";
import useWallet from "src/hooks/useWallet";
import { notifyError } from "src/api/notify";
import TransactionDetails from "src/pages/Dashboard/Transactions/components/TransactionDetails";
import {
    ApproveBridgeStep,
    ApproveZapStep,
    InitiateBridgeStep,
    TransactionStep,
    TransactionStepStatus,
    TransactionTypes,
    WaitForBridgeResultsStep,
    ZapInStep,
} from "src/state/transactions/types";
import { useAppDispatch } from "src/state";
import { addTransactionDb } from "src/state/transactions/transactionsReducer";
import { useDecimals } from "src/hooks/useDecimals";
import useTransaction from "src/hooks/useTransaction";

interface IProps {
    handleClose: Function;
    handleSubmit: (x: { bridgeChainId?: number; txId: string }) => Promise<void>;
    farmId: number;
    inputAmount: number;
    symbol: "usdc" | "native";
    token: Address;
    max: boolean;
}
const DepositModal: FC<IProps> = ({ handleClose, handleSubmit, farmId, inputAmount, symbol, max, token }) => {
    // const { farmDetails } = useFarmDetails();
    const { getPublicClient, currentWallet } = useWallet();
    const { farms } = useFarms();
    const { prices } = usePriceOfTokens();
    const farm = farms.find((item) => item.id === farmId)!;
    const { balances } = useBalances();
    const combined = useMemo(() => getCombinedBalance(balances, farm.chainId, symbol), [balances, symbol]);
    const [checkedNetwork, setCheckedNetwork] = useState<string>();
    const dispatch = useAppDispatch();
    const { decimals } = useDecimals();
    const [txId, setTxId] = useState("");
    const { tx } = useTransaction(txId);
    const isTransacting = useMemo(() => tx?.steps.some((item) => item.status !== TransactionStepStatus.PENDING), [tx]);

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

    useEffect(() => {
        (async function () {
            if (!currentWallet || !!txId) return;
            const toBal = await getBalance(
                symbol === "usdc" ? addressesByChainId[farm.chainId].nativeUsdAddress! : zeroAddress,
                currentWallet,
                { public: getPublicClient(farm.chainId) }
            );
            const toBalDiff = toWei(inputAmount, symbol === "usdc" ? 6 : 18) - toBal;
            let steps: TransactionStep[] = [];
            if (toBalDiff >= 0) {
                steps.push({
                    status: TransactionStepStatus.PENDING,
                    type: TransactionTypes.APPROVE_BRIDGE,
                } as ApproveBridgeStep);
                steps.push({
                    status: TransactionStepStatus.PENDING,
                    type: TransactionTypes.INITIATE_BRIDGE,
                } as InitiateBridgeStep);
                steps.push({
                    status: TransactionStepStatus.PENDING,
                    type: TransactionTypes.WAIT_FOR_BRIDGE_RESULTS,
                } as WaitForBridgeResultsStep);
            }
            let amountInWei = toWei(inputAmount, decimals[farm.chainId][token]);

            steps.push({ status: TransactionStepStatus.PENDING, type: TransactionTypes.APPROVE_ZAP } as ApproveZapStep);
            steps.push({
                status: TransactionStepStatus.PENDING,
                type: TransactionTypes.ZAP_IN,
                amount: amountInWei.toString(),
            } as ZapInStep);

            const dbTx = await dispatch(
                addTransactionDb({
                    from: currentWallet,
                    amountInWei: amountInWei.toString(),
                    date: new Date().toString(),
                    type: "deposit",
                    farmId: farm.id,
                    max: !!max,
                    token,
                    steps,
                })
            );
            const id = dbTx.payload._id;
            setTxId(id);
        })();
    }, []);

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
                <h5 style={{ marginTop: 20 }}>Steps</h5>
                <TransactionDetails
                    showLoadingBar={false}
                    open={true}
                    transactionId={txId}
                    farm={undefined}
                    tx={undefined}
                />
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
                        disabled={!txId || isTransacting}
                        onClick={() => {
                            handleSubmit({ bridgeChainId: Number(checkedNetwork), txId });
                            // handleClose();
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
