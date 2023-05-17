import { Provider } from "@ethersproject/abstract-provider";
import { BigNumber, BigNumberish, Signer, constants, utils } from "ethers";
import { notifyError } from "src/api/notify";
import { defaultChainId } from "src/config/constants";
import { errorMessages } from "src/config/constants/notifyMessages";
import store from "src/state";
import { Farm } from "src/types";

export const getLpAddressForFarmsPrice = (farms: Farm[]) => {
    // temp fix for dodo and stargate wrapped token prices
    // the underlyging tokens are named lp, but they are actaully just wrapped versions of platform tokens, so we
    // cannot calculate their price like normal LP, so instead we just use the base token for price
    return farms.map((farm) =>
        farm.platform === "Dodo" || farm.platform === "Stargate" ? farm.token1 : farm.lp_address
    );
};

export function validateNumberDecimals(value: number, decimals: number = 18) {
    const newVal = noExponents(value);
    const split = newVal.split(".");
    if (split.length === 2) {
        if (split[1].length > decimals) {
            split[1] = split[1].slice(0, decimals);
        }
    }
    return split.join(".");
}

export const noExponents = (n: number | string) => {
    var data = String(n).split(/[eE]/);
    if (data.length === 1) return data[0];

    var z = "",
        // @ts-ignore
        sign = n < 0 ? "-" : "",
        str = data[0].replace(".", ""),
        mag = Number(data[1]) + 1;

    if (mag < 0) {
        z = sign + "0.";
        while (mag++) z += "0";
        return z + str.replace(/^\-/, "");
    }
    mag -= str.length;
    while (mag--) z += "0";
    return str + z;
};

export const calcCompoundingApy = (rewardsApr: number) => {
    const period = 365 / 7; // Number of times compounded per year
    const fee = 0.1; // 10% fee
    const rate = (rewardsApr / 100) * (1 - fee);
    const apy = ((1 + rate / period) ** period - 1) * 100;
    return apy - rewardsApr;
    // return apy;
};

export function getNetworkName(id: number) {
    switch (id) {
        case 42161:
            return "arbitrum";
        case 1:
            return "ethereum";
        default:
            return "";
    }
}

export const toWei = (value: string | number, decimals = 18) => {
    value = Number(value)
        .toFixed(decimals + 1)
        .slice(0, -1);
    return utils.parseUnits(value, decimals);
};

export const toEth = (value: string | BigNumberish, decimals = 18) => {
    return utils.formatUnits(value, decimals);
};

export const toFixedFloor = (value: number, decimalPlaces: number) => {
    //@ts-ignore
    const result = Number(Math.floor(value * 10 ** decimalPlaces) / 10 ** decimalPlaces);
    return result;
};

export const isValidNetwork = (network: string | number) => {
    if (typeof network === "string") {
        if (network === "arbitrum") return true;
    } else if (typeof network === "number") {
        if (network === defaultChainId) return true;
    }
    return false;
};

export const toPreciseNumber = (x: number | string, decimals = 3, precision = 2) => {
    if (typeof x === "string") {
        x = parseFloat(x);
    }
    if (x < 1) {
        return x.toPrecision(precision);
    } else {
        return x.toFixed(decimals);
    }
};

export const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

export const awaitTransaction = async (transaction: any) => {
    let tx;
    let receipt;
    let error;
    let status;
    try {
        tx = await transaction;
        receipt = await tx.wait();
        status = true;
    } catch (e: any) {
        console.info("awaitTransaction error", e);
        // temp fix for zerodev timeout error
        if (Error(e).message === "Error: Timed out") {
            status = true;
            return {
                tx: "",
                receipt: "",
                error,
                status,
            };
        }

        if (e.reason) error = e.reason.replace("execution reverted:", "");
        else if (e.code === 4001) error = "Transaction Denied!";
        else if (e.code === -32000) error = "Insuficient Funds in your account for transaction";
        else if (e.data?.code === -32000) error = "Insuficient Funds in your account for transaction";
        else if (e.data?.message) error = e.data.message;
        else if (Error(e).message) error = Error(e).message;
        status = false;
    }
    return {
        tx,
        receipt,
        error,
        status,
    };
};

export const isZeroDevSigner = (signer: any) => {
    // do we have a better way to do this ?? :/
    if (signer.zdProvider) return true;
    return false;
};

export const getConnectorId = () => {
    return store.getState().settings.connectorId;
};

export const subtractGas = async (
    amountInWei: BigNumber,
    signerOrProvider: Signer | Provider,
    estimatedTx: Promise<BigNumber>,
    showError: boolean = true
) => {
    const balance = BigNumber.from(store.getState().balances.balances[constants.AddressZero]);
    const gasPrice = await signerOrProvider.getGasPrice();
    const gasLimit = await estimatedTx;
    const gasToRemove = gasLimit.mul(gasPrice).mul(2);
    if (amountInWei.add(gasToRemove).gte(balance)) amountInWei = amountInWei.sub(gasToRemove);
    if (amountInWei.lte(0)) {
        showError && notifyError(errorMessages.insufficientGas());
        return undefined;
    }
    return amountInWei;
};

export const customCommify = (
    amount: number | string,
    {
        minimumFractionDigits,
        showDollarSign,
    }: { minimumFractionDigits?: number; showDollarSign?: boolean } | undefined = {}
) => {
    if (typeof amount === "string") amount = parseFloat(amount);
    amount = amount
        .toLocaleString("en-US", {
            style: showDollarSign ? "currency" : undefined,
            currency: showDollarSign ? "USD" : undefined,
            minimumFractionDigits: (minimumFractionDigits ?? 2) + 1,
        })
        .slice(0, minimumFractionDigits === 0 ? -2 : -1);

    return amount;
};
