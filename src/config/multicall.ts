import { Multicall, providers } from "@0xsequence/multicall";
import ethers from "ethers";

const multicall = new Multicall();

// **NOTE** - verbose is used for console loggin
Multicall.DefaultOptions.verbose = false;
Multicall.DefaultOptions.timeWindow = 500;
Multicall.DefaultOptions.batchSize = 250;

export const getMulticallProvider = (provider: ethers.providers.Provider) => {
    return new providers.MulticallProvider(provider, multicall);
};

export default multicall;
