import { useCallback } from "react";
import { useFeeData } from "wagmi";
import useWallet from "./useWallet";
import { MAX_GAS_UNITS_PER_TRANSACTION } from "src/config/constants";
import { BigNumber } from "ethers";
import { errorMessages } from "src/config/constants/notifyMessages";
import { notifyError } from "src/api/notify";

export const useEstimateGasFee = () => {
    const { data } = useFeeData();
    const { balanceBigNumber } = useWallet();

    const isBalanceTooLow = useCallback(() => {
        console.log(
            balanceBigNumber.gt(data!.gasPrice!.mul(BigNumber.from(MAX_GAS_UNITS_PER_TRANSACTION))),
            data!.gasPrice!.mul(BigNumber.from(MAX_GAS_UNITS_PER_TRANSACTION))
        );
        if (
            data &&
            data.gasPrice &&
            balanceBigNumber.gt(data.gasPrice.mul(BigNumber.from(MAX_GAS_UNITS_PER_TRANSACTION)))
        ) {
            return false;
        }
        notifyError(errorMessages.insufficientGas());
        return true;
    }, [data, balanceBigNumber]);

    return { isBalanceTooLow };
};
