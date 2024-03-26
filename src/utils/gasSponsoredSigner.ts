import { TransactionReceipt, TransactionRequest, TransactionResponse } from "@ethersproject/abstract-provider";
import { ExternallyOwnedAccount } from "@ethersproject/abstract-signer";
import { BytesLike, Deferrable, SigningKey } from "ethers/lib/utils.js";
import { Wallet, providers } from "ethers";
import { backendApi } from "src/api";
import { sleep } from "./common";

interface SponsoredTransactionRequest {
    transactionRequest: TransactionRequest;
    signedTransactionHash: string;
}

export class GasSponsoredSigner extends Wallet {
    pendingTransactions = 0;
    nonce = 0;
    constructor(privateKey: BytesLike | ExternallyOwnedAccount | SigningKey, provider?: providers.Provider) {
        super(privateKey, provider);
    }

    override async sendTransaction(transaction: Deferrable<TransactionRequest>): Promise<TransactionResponse> {
        this._checkProvider("sendTransaction");
        const gasPrice = (await this.getGasPrice()).mul(2);
        const gasLimit = transaction.gasLimit || (await this.estimateGas({ ...transaction }));

        transaction.maxPriorityFeePerGas = gasPrice;
        transaction.maxFeePerGas = gasPrice;
        transaction.gasLimit = gasLimit;
        transaction.chainId = await this.getChainId();

        let transactionRequest = await this.populateTransaction(transaction);
        if (this.pendingTransactions > 0) {
            // @ts-ignore
            transactionRequest.nonce = this.nonce;
            this.nonce += 1;
        } else {
            // @ts-ignore
            this.nonce = transactionRequest.nonce + 1;
        }
        const signedTransactionHash = await this.signTransaction(transactionRequest);

        const request: SponsoredTransactionRequest = {
            transactionRequest,
            signedTransactionHash,
        };
        try {
            this.pendingTransactions++;
            const response = await backendApi.post("transaction/send-sponsored-transaction", request);

            const transactionReceipt: TransactionReceipt = response.data.data.receipt;
            const transactionResponse: TransactionResponse = {
                ...(transactionRequest as Required<TransactionResponse>),
                ...transactionReceipt,
                wait: async (confirmations?: number): Promise<TransactionReceipt> => {
                    return this.provider.waitForTransaction(transactionReceipt.transactionHash, confirmations);
                },
            };

            this.pendingTransactions--;
            return { ...transactionResponse };
        } catch (e: any) {
            console.log(e);
            this.pendingTransactions--;
            throw new Error(`${e.response.data.error}`);
        }
    }
}
