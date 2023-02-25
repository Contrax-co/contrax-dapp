import React from "react";
import { getGmxApyArbitrum } from "src/api/getGmxApy";
import useWallet from "src/hooks/useWallet";
import { notify } from "reapop";
import { getPrice } from "src/api/token";
import usePriceOfTokens from "src/hooks/usePriceOfTokens";
import useTransfer from "src/hooks/useTransfer";
import useBalances from "src/hooks/useBalances";
import useConstants from "src/hooks/useConstants";

const Test = () => {
    const { provider, currentWallet } = useWallet();
    const { transferEth, transferToken } = useTransfer();
    const { CONTRACTS } = useConstants();
    const { balances, isLoading, isFetching } = useBalances([
        {
            address: CONTRACTS.wethAddress,
            decimals: 18,
        },
    ]);
    console.log(isLoading, isFetching, balances);

    const fn = () => {
        // transferEth({ to: "0xb78F378D1B23Ecc880fDD97d59B962dC5df47102", amount: 0.000001 });
    };
    // function which takes a number and converts it so that if there are 2 decimal numbers it ceils to two decimals and if there are more than 2 decimals it rounds to the first decimal which is not zero

    return isLoading ? (
        <div onClick={fn} style={{ color: "red" }}>
            Test
        </div>
    ) : (
        <Test2 />
    );
};

export default Test;

const Test2 = () => {
    const { CONTRACTS } = useConstants();
    const { balances, isLoading, isFetching } = useBalances([
        {
            address: CONTRACTS.wethAddress,
            decimals: 18,
        },
    ]);
    console.log(isLoading, isFetching, balances);

    const fn = () => {
        // transferEth({ to: "0xb78F378D1B23Ecc880fDD97d59B962dC5df47102", amount: 0.000001 });
    };
    // function which takes a number and converts it so that if there are 2 decimal numbers it ceils to two decimals and if there are more than 2 decimals it rounds to the first decimal which is not zero

    return (
        <div onClick={fn} style={{ color: "red" }}>
            Test2
        </div>
    );
};
