import * as ethers from "ethers";

export const wethAddress = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";

export const apyPool = async (address: any, setRewardApy: any) => {
    await fetch(
        `https://api.apy.vision/contractInsights/farmSearch/42161/${address}?accessToken=${process.env.REACT_APP_APY_TOKEN}`
    )
        .then((response) => response.json())
        .then((data) => {
            const results: any = JSON.stringify(data.results[0]["apy30d"]);

            setRewardApy(Number(results));
        });
};

export const calculateFeeAPY = async (address: any, setFeeAPY: any) => {
    await fetch(`https://stats.apy.vision/api/v1/pools/${address}?accessToken=${process.env.REACT_APP_APY_TOKEN}`)
        .then((response) => response.json())
        .then((data) => {
            const results: any = JSON.stringify(data[0]["fee_apys_30d"]);

            setFeeAPY(Number(results));
        });
};