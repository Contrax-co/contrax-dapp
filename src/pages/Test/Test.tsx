import React from "react";
import { getGmxApyArbitrum } from "src/api/getGmxApy";
import useWallet from "src/hooks/useWallet";
import { notify } from "reapop";
import { getPrice } from "src/api/token";
import usePriceOfTokens from "src/hooks/usePriceOfTokens";

const Test = () => {
    const { provider, currentWallet } = useWallet();
    const { prices } = usePriceOfTokens(["0x69Eb4FA4a2fbd498C257C57Ea8b7655a2559A581"]);
    const dodoPrice = prices["0x69Eb4FA4a2fbd498C257C57Ea8b7655a2559A581"];

    React.useEffect(() => {
        getGmxApyArbitrum(provider, currentWallet).then(console.log);
    }, [provider, currentWallet]);

    const fn = async () => {
        const latestBlock = await provider.getBlockNumber();
        const latestBlockTimestamp = (await provider.getBlock(latestBlock)).timestamp;
        const oldBlockTimestamp = (await provider.getBlock(latestBlock - 200000)).timestamp;
        const difference = latestBlockTimestamp - oldBlockTimestamp;
        const blocksPerDay = (difference / 200000) * 86400;
        console.log("blocksPerDay", blocksPerDay);
        const rewardPerBlock = 0.5;
        const numOfBlocksPerDay = blocksPerDay;
        const rewardPerDay = rewardPerBlock * numOfBlocksPerDay;
        const rewardPerYear = rewardPerDay * 365;
        const price = 0.1335;
        const allocation = 0.4999;
        // const alloc = 1;
        // const totalAlloc = 1;

        const rewardPerYearUsd = rewardPerYear * price * allocation;

        // const tvlUsd = 1201566.276948;
        const tvlUsd = 1172057.091368;
        let apr = (rewardPerYearUsd / tvlUsd) * 100;
        const constant = 3.93;
        apr /= constant;
        console.log("apr", apr);
    };

    // function which takes a number and converts it so that if there are 2 decimal numbers it ceils to two decimals and if there are more than 2 decimals it rounds to the first decimal which is not zero

    return (
        <div onClick={fn} style={{ color: "red" }}>
            Test
        </div>
    );
};

export default Test;