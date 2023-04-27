import { TransactionReceipt, TransactionRequest, TransactionResponse } from "@ethersproject/abstract-provider";
import { ExternallyOwnedAccount } from "@ethersproject/abstract-signer";
import { BytesLike, Deferrable, SigningKey } from "ethers/lib/utils.js";
import { Wallet, providers } from "ethers";
import { backendApi } from "src/api";
import { provider } from "src/config/walletConfig";

interface SponsoredTransactionRequest {
    transactionRequest: TransactionRequest;
    signedTransactionHash: string;
}

export class GasSponsoredSigner extends Wallet {
    constructor(privateKey: BytesLike | ExternallyOwnedAccount | SigningKey, provider?: providers.Provider) {
        super(privateKey, provider);
    }

    override async sendTransaction(transaction: Deferrable<TransactionRequest>): Promise<TransactionResponse> {
        this._checkProvider("sendTransaction");
        const gasPrice = await this.getGasPrice();
        const gasLimit = await this.estimateGas(transaction);

        transaction.maxPriorityFeePerGas = 0;
        transaction.maxFeePerGas = gasPrice;
        transaction.gasLimit = gasLimit;
        transaction.chainId = await this.getChainId();
        const transactionRequest = await this.populateTransaction(transaction);
        const signedTransactionHash = await this.signTransaction(transactionRequest);

        const request: SponsoredTransactionRequest = {
            transactionRequest,
            signedTransactionHash,
        };

        try {
            const response = await backendApi.post("transaction/send-sponsored-transaction", request);
            const transactionReceipt: TransactionReceipt = response.data.data.receipt;
            const transactionResponse: TransactionResponse = {
                ...(transactionRequest as Required<TransactionResponse>),
                ...transactionReceipt,
                wait: async (confirmations?: number): Promise<TransactionReceipt> => {
                    return this.provider.waitForTransaction(transactionReceipt.transactionHash, confirmations);
                },
            };

            return { ...transactionResponse };
        } catch (e: any) {
            console.log(e);
            throw new Error(`${e.response.data.error}`);
        }
    }
}
