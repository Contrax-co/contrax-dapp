import React from "react";
import { Contract } from "ethers";
import useWallet from "./useWallet";

const useContract = (contractAddress: string, abi: any) => {
    const { provider, signer } = useWallet();
    const contract = React.useMemo(
        () => new Contract(contractAddress, abi, signer || provider),
        [contractAddress, abi, signer, provider]
    );
    return contract;
};

export default useContract;
