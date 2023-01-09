import * as ethers from "ethers";
import { APY_TOKEN, APY_VISION_URL } from "src/config/constants";

export const totalArbitrumUsd = async (currentWallet: any, setTotalUsd: any) => {
    await fetch(`${APY_VISION_URL}/portfolio/42161/core/${currentWallet}?accessToken=${APY_TOKEN}`)
        .then((response) => response.json())
        .then((data) => {
            const total = JSON.stringify(data);

            const totalValue = JSON.parse(total);

            const totalValueUsd = totalValue[`totalValueUsd`];

            setTotalUsd(totalValueUsd?.toFixed(2));
        });
};