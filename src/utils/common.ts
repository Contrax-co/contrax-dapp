import { notifyError } from "src/api/notify";
import { defaultChainId } from "src/config/constants";
import { errorMessages } from "src/config/constants/notifyMessages";
import store from "src/state";
import { Farm, IClients } from "src/types";
import { createWeb3Name } from "@web3-name-sdk/core";
import { Address, getAddress, TransactionReceipt, parseUnits, formatUnits, zeroAddress } from "viem";

import { waitForTransactionReceipt } from "viem/actions";

const web3Name = createWeb3Name();

export const resolveEnsDomain = async (str: string) => {
    let addr = null;
    try {
        addr = getAddress(str) as Address;
    } catch {
        addr = (await web3Name.getAddress(str)) as Address;
    }
    return addr;
};

export const resolveDomainFromAddress = async (addr: string) => {
    const name = await web3Name.getDomainName({
        address: addr,
        queryChainIdList: [defaultChainId],
    });
    return name;
};

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
    return (apy - rewardsApr) * -1; // multiply by -1 to get positive number
    // return apy;
};

export function getNetworkName(id: number) {
    switch (id) {
        case 42161:
            return "arbitrum";
        case 1:
            return "ethereum";
        case 137:
            return "polygon";
        default:
            return "";
    }
}

export const toWei = (value: string | number, decimals = 18) => {
    value = Number(value)
        .toFixed(decimals + 1)
        .slice(0, -1);
    return parseUnits(value, decimals);
};

export const toEth = (value: bigint, decimals = 18) => {
    return formatUnits(value, decimals);
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

export const awaitTransaction = async (transaction: Promise<Address>, client: Omit<IClients, "wallet">) => {
    let txHash: Address | undefined;
    let receipt: TransactionReceipt | undefined;
    let error: string | undefined;
    let status: boolean;
    try {
        txHash = await transaction;
        receipt = await waitForTransactionReceipt(client.public, { hash: txHash });
        status = true;
        if (receipt.status === "reverted") {
            throw new Error("Transaction reverted on chain!");
        }
    } catch (e: any) {
        console.info("awaitTransaction error", e);
        status = false;
        error = e.shortMessage || e.details || e.message || e.response?.data?.message || "Something went wrong!";
    }
    return {
        txHash,
        receipt,
        error,
        status,
    };
};

export const getConnectorId = () => {
    return store.getState().settings.connectorId;
};

export const subtractGas = async (
    amountInWei: bigint,
    client: Pick<IClients, "public">,
    estimatedTx: Promise<bigint>,
    showError: boolean = true,
    _balance: bigint | undefined = undefined
) => {
    const balance = _balance ? _balance : BigInt(store.getState().balances.balances[zeroAddress] || "0");
    const gasPrice = await client.public.getGasPrice();
    const gasLimit = await estimatedTx;
    const gasToRemove = gasLimit * gasPrice * 3n;
    if (amountInWei + gasToRemove >= balance) amountInWei = amountInWei - gasToRemove;
    if (amountInWei <= 0) {
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
