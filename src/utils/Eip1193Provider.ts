import { ethers } from "ethers";
import { IClients } from "src/types";

export const getEip1193Provider = (client: IClients): ethers.providers.Web3Provider => {
    return new ethers.providers.Web3Provider({
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

                case "eth_signTypedData_v4":
                    try {
                        let obj = { ...JSON.parse(params[1]), account: params[0] };
                        // obj.domain.chainId = BigInt(obj.domain.chainId);
                        // obj.message.details.amount = BigInt(obj.message.details.amount);
                        // console.log("obj =>", obj);
                        // convertMultipleToBigInt(obj, [
                        //     "domain.chainId",
                        //     "message.details.amount",
                        //     "message.details.expiration",
                        //     "message.details.nonce",
                        //     "message.sigDeadline",
                        // ]);
                        console.log("obj =>", obj);
                        const sig = await client.wallet.signTypedData(obj);
                        console.log("sig =>", sig);
                        return sig;
                    } catch (error) {
                        console.error(error);
                        throw error;
                    }

                default:
                    // @ts-ignore
                    return await client.public.request({ method, params });
            }
        },
    });
};

function convertMultipleToBigInt(obj: Object, paths: string[]) {
    paths.forEach((path) => {
        const keys = path.split(".");
        let current = obj as any;

        for (let i = 0; i < keys.length - 1; i++) {
            if (current[keys[i]] !== undefined) {
                current = current[keys[i]];
            } else {
                current = undefined;
                break;
            }
        }

        // @ts-ignore
        if (current[keys.at(-1)]) {
            // @ts-ignore
            current[keys.at(-1)] = BigInt(current[keys.at(-1)]);
        }
    });
}
