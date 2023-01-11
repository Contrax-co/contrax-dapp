export const findTotalAPY = (apy: number, totalAPY: number, platform: string) => {
    // Compounded APY = (((1 + (0.9*rate/period))^period) - 1) + baseAPY
    let rate;
    if (platform === "Dodo") {
        rate = apy / 100;
    } else {
        rate = apy / 100;
    }

    const period = 365; //weekly

    const baseAPY = totalAPY / 100 - apy / 100;

    const APY = (1 + rate / period) ** period - 1 + baseAPY;
    return APY * 100;
};

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
