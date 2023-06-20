import { TransactionReceipt, TransactionRequest, TransactionResponse } from "@ethersproject/abstract-provider";
import { ExternallyOwnedAccount } from "@ethersproject/abstract-signer";
import { Bytes, BytesLike, Deferrable, SigningKey } from "ethers/lib/utils.js";
import { Wallet, providers, Signer, BigNumber } from "ethers";
import { backendApi } from "src/api";
import SmartAccount from "@biconomy/smart-account";
import { SmartAccountState, SmartAccountVersion, ChainId } from "@biconomy/core-types";

export class BiconomySigner extends Signer {
    public smartAccount!: SmartAccount;

    constructor(provider: providers.Web3Provider) {
        super();
        this.init(provider);
    }

    async init(provider: providers.Web3Provider) {
        const wallet = new SmartAccount(provider, {
            activeNetworkId: ChainId.ARBITRUM_ONE_MAINNET,
            supportedNetworksIds: [ChainId.ARBITRUM_ONE_MAINNET, ChainId.POLYGON_MAINNET, ChainId.MAINNET],
            networkConfig: [
                {
                    chainId: ChainId.ARBITRUM_ONE_MAINNET,
                    dappAPIKey: "LNyR-YF15.5528fd61-d34c-4a35-bb92-69510d521b1f",
                },
                {
                    chainId: ChainId.POLYGON_MAINNET,
                    dappAPIKey: "LNyR-YF15.5528fd61-d34c-4a35-bb92-69510d521b1f",
                },
            ],
        });
        await wallet.init();
        await wallet.deployWalletUsingPaymaster();
        this.smartAccount = wallet;
    }

    async getAddress(): Promise<string> {
        return this.smartAccount.address;
    }
    signMessage(message: string | Bytes): Promise<string> {
        return this.smartAccount.signer.signMessage(message);
    }
    signTransaction(transaction: Deferrable<TransactionRequest>): Promise<string> {
        return this.smartAccount.signer.signTransaction(transaction);
    }
    connect(provider: providers.Provider): Signer {
        throw new Error("Method not implemented.");
    }

    override async sendTransaction(transaction: Deferrable<TransactionRequest>): Promise<TransactionResponse> {
        this._checkProvider("sendTransaction");

        const txResponse = await this.smartAccount.sendTransaction({
            transaction: {
                to: (await transaction.to) || "",
                data: (await transaction.data)?.toString() || "0x",
                value: (await transaction.value) || "0",
            },
        });
        console.log("userOp hash", txResponse.hash);
        // If you do not subscribe to listener, one can also get the receipt like shown below
        // const txReciept = await txResponse.wait();
        // console.log("Tx hash", txReciept.transactionHash);

        return txResponse;
    }
}
