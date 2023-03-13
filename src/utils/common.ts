import { BigNumberish, utils } from "ethers";
import { defaultChainId } from "src/config/constants";
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
    const period = 365 / 7; // Number of Weeks
    const rate = rewardsApr / 100;
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

export const toWei = (value: string, decimals = 18) => {
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
