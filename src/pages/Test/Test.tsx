import json from "src/config/constants/pools.json";
import { utils } from "ethers";

const Test = () => {
    const fn = () => {
        // @ts-ignore
        let newObj = [...json];
        newObj.forEach((item, i) => {
            newObj[i].lp_address = utils.getAddress(newObj[i].lp_address);
            newObj[i].token1 = utils.getAddress(newObj[i].token1);
            // @ts-ignore
            if (newObj[i].token2) newObj[i].token2 = utils.getAddress(newObj[i].token2);
        });
        console.log(newObj);
    };
    return (
        <div onClick={fn} style={{ color: "red" }}>
            Test
        </div>
    );
};

export default Test;
