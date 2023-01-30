// export const findTotalAPY = (apy: number, totalAPY: number, platform: string) => {
//     // Compounded APY = (((1 + (0.9*rate/period))^period) - 1) + baseAPY
//     let rate;
//     if (platform === "Dodo") {
//         rate = apy / 100;
//     } else {
//         rate = apy / 100;
//     }

//     const period = 365; //weekly

//     const baseAPY = totalAPY / 100 - apy / 100;

//     const APY = (1 + rate / period) ** period - 1 + baseAPY;
//     return APY * 100;
// };

export const findCompoundAPY = (apy: number, totalAPY: number, platform: string) => {
    // Compounded APY = (((1 + (0.9*rate/period))^period) - 1)
    let rate;
    if (platform === "Dodo") {
        rate = apy / 100;
    } else {
        rate = apy / 100;
    }

    const period = 365; //weekly

    const baseAPY = totalAPY / 100 - apy / 100;

    const APY = (1 + rate / period) ** period - 1 + baseAPY;
    const compoundAPY = APY - totalAPY / 100;
    return compoundAPY * 100 * 0.9;
};

export const calculateFarmAPY = (rewardAPY: number) => {
    // Compounded APY = (((1 + (0.9*rate/period))^period) - 1)
    const rate = rewardAPY / 100;
    const period = 52;

    const APY = (1 + (0.9 * rate) / period) ** period - 1;
    return APY * 100;
};

export const totalFarmAPY = (rewardAPY: number, feeAPY: number) => {
    // total APY = (((1 + (0.9*rate/period))^period) - 1) + baseAPY
    const rate = rewardAPY / 100;
    const baseAPY = feeAPY / 100;
    const period = 52;

    const APY = (1 + (0.9 * rate) / period) ** period - 1 + baseAPY;
    return APY * 100;
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

export const noExponents = (n: number) => {
    var data = String(n).split(/[eE]/);
    if (data.length == 1) return data[0];

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
