import json from "src/config/constants/pools.json";
import { utils } from "ethers";
import { getEarnings } from "src/api/farms";
import useWallet from "src/hooks/useWallet";
import { getPricesByTime } from "src/api/token";

const Test = () => {
    const { currentWallet, networkId } = useWallet();
    const fn = () => {
        getPricesByTime(
            [
                { address: "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8", timestamp: 1671193781 },
                { address: "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8", timestamp: 1679193781 },
            ],
            networkId
        ).then((res) => {
            console.log(res);
        });
    };
    return (
        <div onClick={fn} style={{ color: "red" }}>
            Test
        </div>
    );
};

export default Test;
