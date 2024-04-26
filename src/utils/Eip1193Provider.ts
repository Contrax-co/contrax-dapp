import { Block, BlockWithTransactions, TransactionReceipt } from "@ethersproject/abstract-provider";
import { Transaction, ethers, BigNumber } from "ethers";
import { IClients } from "src/types";
import { EIP1193Provider } from "viem";

export const getEip1193Provider = (client: IClients) => {
    return new ethers.providers.Web3Provider({
        on: (event, listener) => {
            console.log("event, listener =>", event, listener);
        },
        removeListener(event, listener) {
            console.log("remove event, listener =>", event, listener);
        },
        // @ts-ignore
        request: async ({ method, params, ...rest }: { method: string; params: any }) => {
            console.log("method, params =>", method, params, rest);

            switch (method) {
                case "eth_chainId":
                    return await client.public.getChainId();
                case "eth_blockNumber":
                    return await client.public.getBlockNumber();
                case "eth_getBalance":
                    return await client.public.getBalance({ address: params[0], blockNumber: params[1] });
                case "eth_call":
                    return await client.public.call({
                        to: params[0].to,
                        data: params[0].data,
                        blockNumber: BigInt(Number(params[1])),
                    });
                case "eth_accounts":
                    return [client.wallet.account.address];
                case "eth_estimateGas":
                    return await client.wallet.estimateTxGas({
                        data: params[0].data,
                        to: params[0].to,
                        value: params[0].value || 0n,
                    });
                case "eth_sendTransaction":
                    return await client.wallet.sendTransaction({
                        data: params[0].data,
                        to: params[0].to,
                    });
                case "eth_getTransactionByHash":
                    return await client.public.request({ method, params });

                case "eth_getTransactionCount":
                    return await client.public.getTransactionCount({ address: params[0], blockTag: params[1] });

                default:
                    // @ts-ignore
                    return await client.public.request({ method, params });
            }
        },
    });
};
