import { Multicall, providers } from "@0xsequence/multicall";
import ethers from "ethers";

export const multicall = new Multicall({
    timeWindow: 1000, // 1second
    verbose: true,
    batchSize: 100,
});
Multicall.DefaultOptions.verbose = true;
Multicall.DefaultOptions.timeWindow = 1000;
Multicall.DefaultOptions.batchSize = 100;

export const getMulticallProvider = (provider: ethers.providers.Provider) => {
    return new providers.MulticallProvider(provider, multicall);
};

export default multicall;
