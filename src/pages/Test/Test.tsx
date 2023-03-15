import json from "src/config/constants/pools.json";
import { utils } from "ethers";
import { getEarnings } from "src/api/farms";
import useWallet from "src/hooks/useWallet";

const Test = () => {
    const { currentWallet } = useWallet();
    const fn = () => {
        getEarnings(currentWallet).then((res) => {
            console.log("getEarnings", res[0].deposit);
        });
    };
    return (
        <div onClick={fn} style={{ color: "red" }}>
            Test
        </div>
    );
};

export default Test;
