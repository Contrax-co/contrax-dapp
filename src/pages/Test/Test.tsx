import React from "react";
import { getGmxApyArbitrum } from "src/api/getGmxApy";
import useWallet from "src/hooks/useWallet";
import { notify } from "reapop";
import { getPrice } from "src/api/token";
import usePriceOfTokens from "src/hooks/usePriceOfTokens";
import useTransfer from "src/hooks/useTransfer";
import useBalances from "src/hooks/useBalances";
import useConstants from "src/hooks/useConstants";
import useFarmDetails from "src/hooks/farms/useFarmDetails";

const Test = () => {
    const { provider, currentWallet } = useWallet();
    const [state, setState] = React.useState(true);

    const fn = () => {
        setState(!state);
    };
    // function which takes a number and converts it so that if there are 2 decimal numbers it ceils to two decimals and if there are more than 2 decimals it rounds to the first decimal which is not zero

    return (
        <div onClick={fn} style={{ color: "red" }}>
            Test
        </div>
    );
};

export default Test;
