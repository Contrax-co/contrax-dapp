import { Connector, Chain } from "wagmi";
import { providers } from "ethers";
import SocialLogin from "@biconomy/web3-auth";
import { ChainId } from "@biconomy/core-types";
import { BiconomySigner } from "./biconomySigner";
import { a } from "@wagmi/connectors/dist/base-542af431";

interface WalletOptions {}

export class BiconomyWalletConnector extends Connector<providers.Web3Provider, WalletOptions> {
    readonly id = "biconomy";
    readonly name = "Biconomy";
    readonly ready = true;
    private isConnected = false;
    private socialLoginSDK: SocialLogin | undefined;

    private provider!: providers.Web3Provider;
    private signer: BiconomySigner | undefined;
    private chainId: number = ChainId.ARBITRUM_ONE_MAINNET;

    constructor(config: { chains?: Chain[]; options: WalletOptions }) {
        super(config);
        const sdk = new SocialLogin();
        sdk.init().then(async () => {
            sdk.showWallet();
            const web3Provider = new providers.Web3Provider(sdk.provider!);
            this.provider = web3Provider;
            this.signer = new BiconomySigner(web3Provider);
            this.socialLoginSDK = sdk;
        });
    }

    async getProvider() {
        return this.provider;
    }

    async disconnect(): Promise<void> {
        await this.socialLoginSDK!.logout();
        this.signer = undefined;
        (window as any).getSocialLoginSDK = null;
        this.socialLoginSDK!.hideWallet();
    }
    getAccount(): Promise<`0x${string}`> {
        // @ts-ignore
        return this.signer?.getAddress();
    }
    async getChainId(): Promise<number> {
        return this.chainId;
    }
    async getSigner(config?: { chainId?: number | undefined } | undefined): Promise<any> {
        return this.signer;
    }
    isAuthorized(): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    protected onAccountsChanged(accounts: `0x${string}`[]): void {
        throw new Error("Method not implemented.");
    }
    protected onChainChanged(chain: string | number): void {
        throw new Error("Method not implemented.");
    }
    protected onDisconnect(error: Error): void {
        throw new Error("Method not implemented.");
    }
    async connect(config?: { chainId?: number | undefined } | undefined): Promise<Required<a<any>>> {
        const sdk = new SocialLogin();
        sdk.init().then(async () => {
            sdk.showWallet();
            const web3Provider = new providers.Web3Provider(sdk.provider!);
            this.provider = web3Provider;
            this.signer = new BiconomySigner(web3Provider);
            this.socialLoginSDK = sdk;
        });
        // @ts-ignore
        return null;
    }
}
