import React from "react";
import { getGmxApyArbitrum } from "src/api/getGmxApy";
import useWallet from "src/hooks/useWallet";
import { notify } from "reapop";
import { getPrice } from "src/api/token";
import usePriceOfTokens from "src/hooks/usePriceOfTokens";
import useTransfer from "src/hooks/useTransfer";

const Test = () => {
    const { provider, currentWallet } = useWallet();
    const { transferEth, transferToken } = useTransfer();

    const fn = () => {
        // transferEth({ to: "0xb78F378D1B23Ecc880fDD97d59B962dC5df47102", amount: 0.000001 });
        transferToken({
            tokenAddress: "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a",
            to: "0xb78F378D1B23Ecc880fDD97d59B962dC5df47102",
            amount: 0.02,
        });
    };
    // function which takes a number and converts it so that if there are 2 decimal numbers it ceils to two decimals and if there are more than 2 decimals it rounds to the first decimal which is not zero

    return (
        <div onClick={fn} style={{ color: "red" }}>
            Test
        </div>
    );
};

export default Test;
