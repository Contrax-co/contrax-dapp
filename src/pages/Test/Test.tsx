import json from "src/config/constants/pools.json";
import { utils } from "ethers";
import { getEarnings } from "src/api/farms";
import useWallet from "src/hooks/useWallet";
import { getPricesByTime } from "src/api/token";
import useTotalSupplies from "src/hooks/useTotalSupplies";
import usePriceOfTokens from "src/hooks/usePriceOfTokens";
import useFarms from "src/hooks/farms/useFarms";

const Test = () => {
    const { currentWallet, networkId } = useWallet();
    const { farms } = useFarms();
    const { formattedSupplies } = useTotalSupplies();
    const { prices } = usePriceOfTokens();
    const fn = () => {
        let sum = 0;
        farms.forEach((farm) => {
            sum += (formattedSupplies[farm.vault_addr] || 1) * prices[farm.vault_addr];
        });
        console.log("sum", sum);
    };
    return (
        <div onClick={fn} style={{ color: "red" }}>
            Test
        </div>
    );
};

export default Test;
