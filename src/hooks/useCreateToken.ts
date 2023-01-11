import { useMemo } from "react";
import erc20 from "src/assets/abis/erc20.json";
import * as ethers from "ethers";
import { CreateToken } from "src/types";
import useWallet from "./useWallet";
import useNotify from "./useNotify";
import { useIsMutating, useMutation } from "@tanstack/react-query";
import { CREATE_TOKEN } from "src/config/constants/query";
import useConstants from "./useConstants";

const abi = erc20.abi;
const bytecode = erc20.bytecode;

const useCreateToken = () => {
    const { signer, currentWallet } = useWallet();
    const { NETWORK_NAME } = useConstants();
    const { dismissNotify, notifyError, notifyLoading, notifySuccess } = useNotify();

    const create = async ({
        name,
        symbol,
        decimal,
        initialSupply,
        burnPercentage,
        burnPercantageIdentifier,
        transactionFeePercentage,
        transactionFeePercentageIdentiier,
        mintable,
    }: CreateToken) => {
        const ldecimal = 1;
        const hdecimal = 19;
        const lts = -1;
        const hts = 99999999999999999;
        const notiId = notifyLoading("Creating Token!", "Please wait while we create your token");
        try {
            if (decimal > ldecimal && decimal < hdecimal) {
                if (symbol.length < 16) {
                    if (initialSupply > lts && initialSupply < hts) {
                        if (name.length < 64) {
                            const dec: any = decimal.toString();
                            const ts: any = initialSupply.toString();
                            const factory = new ethers.ContractFactory(abi, bytecode, signer);
                            const contract = await factory.deploy(
                                name,
                                symbol,
                                decimal,
                                initialSupply,
                                burnPercentage,
                                burnPercantageIdentifier,
                                transactionFeePercentage,
                                transactionFeePercentageIdentiier,
                                mintable
                            );
                            await contract.deployed();

                            const add = contract.address;
                            const addd = await contract.deployTransaction.wait();

                            if (!addd.blockNumber) {
                            } else {
                                notifySuccess(
                                    "Token Created",
                                    "Your token was created successfully! Please allow a few minutes for confirmation then the token will appear in your Token Table"
                                );
                            }
                        } else {
                            notifyError("Something went wrong", "Token Name must be between 1 and 64 characters");
                        }
                    } else {
                        notifyError("Something went wrong", "Token Supply must be between 1 and 99999999999999999");
                    }
                } else {
                    notifyError("Something went wrong", "Token Name is more than 16 characters");
                }
            } else {
                notifyError("Something went wrong", "Decimal must be a whole number between 1 and 18");
            }
        } catch (error) {
            let err = JSON.parse(JSON.stringify(error));
            notifyError("Error!", err.reason || err.message);
        } finally {
            dismissNotify(notiId);
        }
    };

    const { mutate: createToken, mutateAsync: createTokenAsync } = useMutation({
        mutationFn: create,
        mutationKey: CREATE_TOKEN(currentWallet, NETWORK_NAME),
    });

    /**
     * isMutating is number of times a function is being currently ran
     */
    const isMutating = useIsMutating(CREATE_TOKEN(currentWallet, NETWORK_NAME));

    const isLoading = useMemo(() => isMutating > 0, [isMutating]);

    return {
        /**
         * Create Token by calling this function, it can take callbacks to handle success and error
         */
        createToken,

        /**
         * Create Token by calling this function, it returns a promise
         */
        createTokenAsync,

        /**
         * Loading state for when creating token
         */
        isLoading,
    };
};

export default useCreateToken;
