import { useCallback } from "react";
import { useFeeData } from "wagmi";
import { MAX_GAS_UNITS_PER_TRANSACTION } from "src/config/constants";
import { BigNumber } from "ethers";
import { errorMessages } from "src/config/constants/notifyMessages";
import { notifyError } from "src/api/notify";
import useBalances from "./useBalances";

export const useEstimateGasFee = () => {
    const { data } = useFeeData();
    const { ethBalance } = useBalances();
    const isBalanceTooLow = useCallback(() => {
        return false;
        // if (data && data.gasPrice && ethBalance.gt(data.gasPrice.mul(BigNumber.from(MAX_GAS_UNITS_PER_TRANSACTION)))) {
        //     return false;
        // }
        // notifyError(errorMessages.insufficientGas());
        // return true;
    }, [data, ethBalance]);

    return { isBalanceTooLow };
};
