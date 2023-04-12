import { Multicall, providers } from "@0xsequence/multicall";
import ethers from "ethers";

const multicall = new Multicall();
Multicall.DefaultOptions.verbose = true;
Multicall.DefaultOptions.timeWindow = 500;
Multicall.DefaultOptions.batchSize = 150;

export const getMulticallProvider = (provider: ethers.providers.Provider) => {
    return new providers.MulticallProvider(provider, multicall);
};

export default multicall;
