import { Apys } from "src/state/apys/types";
import { FarmOriginPlatform, FarmType } from "./enums";
import { FarmDataProcessed } from "src/api/pools/types";
import {
    PublicClient,
    Transport,
    Chain,
    Address,
    WalletClient,
    Account,
    CustomTransport,
    JsonRpcAccount,
    createWalletClient,
    HttpTransport,
    Hex,
    LocalAccount,
} from "viem";
import { ENTRYPOINT_ADDRESS_V07, SmartAccountClient } from "permissionless";
import { KernelEcdsaSmartAccount } from "permissionless/accounts";
import { Web3AuthSigner } from "@alchemy/aa-signers/web3auth";
import { createModularAccountAlchemyClient } from "@alchemy/aa-alchemy";
import { PoolDef } from "src/config/constants/pools_json";
import { Balances } from "src/state/balances/types";

export interface FarmDetails extends PoolDef {
    userVaultBalance: number;
    totalVaultBalance: number;
    totalPlatformBalance: number;
    priceOfSingleToken: number;
    apys: Apys;
}

export interface Vault extends PoolDef {
    userVaultBalance: number;
    priceOfSingleToken: number;
    apys: Apys;
}

export interface Token {
    address: Address;
    name: string;
    token_type: FarmType;
    logo: string;
    logo2?: string;
    /**
     * Formatted Balance
     */
    balance: string;
    usdBalance: string;
    decimals: number;
    network?: string;
    networkId: number;
    price: number;
}
export interface FarmData extends FarmDataProcessed {}
export interface FarmDataExtended extends Partial<Omit<FarmData, "id">>, PoolDef {
    apy: number;
}
export interface NotifyMessage {
    title: string;
    message: string | ((params: string) => string);
}

export interface ErrorMessages {
    generalError: (message: string) => NotifyMessage;
    insufficientGas: () => NotifyMessage;
    privateKeyError: () => NotifyMessage;
}

export interface SuccessMessages {
    deposit: () => NotifyMessage;
    zapIn: () => NotifyMessage;
    withdraw: () => NotifyMessage;
    tokenTransfered: () => NotifyMessage;
}

export interface LoadingMessages {
    approvingZapping: () => NotifyMessage;
    zapping: (tx?: string) => NotifyMessage;
    approvingWithdraw: () => NotifyMessage;
    confirmingWithdraw: () => NotifyMessage;
    withDrawing: (tx?: string) => NotifyMessage;
    approvingDeposit: () => NotifyMessage;
    confirmDeposit: () => NotifyMessage;
    depositing: (tx?: string) => NotifyMessage;
    transferingTokens: () => NotifyMessage;
    gettingBridgeQuote: () => NotifyMessage;
    bridgeStep: (step: number, totalSteps: number) => NotifyMessage;
    bridgeDestTxWait: () => NotifyMessage;
    withdrawBridgeQuote: () => NotifyMessage;
    withdrawBridgeStep: (step: number, totalSteps: number) => NotifyMessage;
    withdrawBridgeDestTxWait: () => NotifyMessage;
}

export interface AccountInfo {
    _id: string;
    address: string;
    referralCode?: string;
    referrer?: AccountInfo;
    createdAt: string;
    updatedAt: string;
}

export interface AccountDetails extends UserTVL {
    _id: string;
    accountInfo: AccountInfo;
    earnedTrax: string;
    earnedTraxByReferral: number;
    traxCalculatedTimeStamp: number;
    totalEarnedTrax: number;
    totalEarnedTraxByReferral: number;
    tvl: number;
}

export interface UserTVL {
    id: string;
    tvl: number;
    address: string;
    createdAt: string;
    updatedAt: string;
    vaultTvls: UserVVL[];
}

export interface UserVVL {
    price: number;
    usdAmount: number;
    userBalance: string;
    vaultAddress: string;
    _id: string;
}

export type Order = "" | "-";

export interface WertOptions {
    /**
     * Provided when you register as a partner.
     */
    partner_id: string;
    /**
     * ID of the parent DOM element where you want to integrate the module.
     */
    container_id: string;
    /**
     * Initialises the module in the sandbox/production environment.
     */
    origin?: string;
    /**
     * When true, opens the widget in the purchase details screen.
     */
    skip_init_navigation?: boolean;
    /**
     * Unique identifier for the order which helps you track it and us troubleshoot issues.
     */
    click_id?: string;
    /**
     * By default, module will use 100% of the width and 100% of the height of the parent element.
If 'true', width and height options are ignored.
     */
    autosize?: boolean;
    /**
     * Fixed module width, in pixels.
     */
    width?: number;
    /**
     * Fixed module height, in pixels.
     */
    height?: number;
    /**
     * Module will use theme colors as a basis.
     */
    theme?: string;
    /**
     * Default fiat currency which will be selected when the module opens.
     */
    currency?: string;
    /**
     * Default amount in fiat currency which will be pre-filled in the module.
Minimum value is $5.
     */
    currency_amount?: number;
    /**
     * Default crypto asset that will be selected in the module.
     */
    commodity?: string;
    /**
     * Network for the default crypto asset.
     */
    network?: string;
    /**
     * Crypto assets that will be available in the module, as a stringified JSON of an array of objects with commodity and network fields.
     */
    commodities?: string;
    /**
     * Default crypto amount that will be pre-filled in the module. This option is ignored if currency_amount is set.
     */
    commodity_amount?: number;
    /**
     * User's wallet address.
Address is checked for validity based on the chosen crypto commodity. If address is invalid, this option is ignored.
BTC address format is used as default.
     */
    address?: string;
    /**
     * URL where user will be redirected from KYC emails to proceed with the payment.
     */
    redirect_url?: string;
    /**
     * User's email address.
     */
    email?: string;
    /**
     * Use this if you want to listen to some events in the module and react to them.
     */
    listeners?: object;
    /**
     * Language of the widget
     * @example en - for English
fr - for French
     */
    lang?: string;
    /**
     * Color customisation of specific elements of Wert module.
Go to the module tuner on the partner dashboard to see how each property affects the widget.
     */
    color_background?: string;
    /**
 * Color customisation of specific elements of Wert module.
Go to the module tuner on the partner dashboard to see how each property affects the widget.
 */
    color_buttons?: string;
    /**
 * Color customisation of specific elements of Wert module.
Go to the module tuner on the partner dashboard to see how each property affects the widget.
 */
    color_buttons_text?: string;
    /**
 * Color customisation of specific elements of Wert module.
Go to the module tuner on the partner dashboard to see how each property affects the widget.
 */
    color_secondary_buttons?: string;
    /**
 * Color customisation of specific elements of Wert module.
Go to the module tuner on the partner dashboard to see how each property affects the widget.
 */
    color_secondary_buttons_text?: string;
    /**
 * Color customisation of specific elements of Wert module.
Go to the module tuner on the partner dashboard to see how each property affects the widget.
 */
    color_main_text?: string;
    /**
 * Color customisation of specific elements of Wert module.
Go to the module tuner on the partner dashboard to see how each property affects the widget.
 */
    color_secondary_text?: string;
    /**
 * Color customisation of specific elements of Wert module.
Go to the module tuner on the partner dashboard to see how each property affects the widget.
 */
    color_icons?: string;
    /**
 * Color customisation of specific elements of Wert module.
Go to the module tuner on the partner dashboard to see how each property affects the widget.
 */
    color_links?: string;
    /**
 * Color customisation of specific elements of Wert module.
Go to the module tuner on the partner dashboard to see how each property affects the widget.
 */
    color_success?: string;
    /**
 * Color customisation of specific elements of Wert module.
Go to the module tuner on the partner dashboard to see how each property affects the widget.
 */
    color_warning?: string;
    /**
 * Color customisation of specific elements of Wert module.
Go to the module tuner on the partner dashboard to see how each property affects the widget.
 */
    color_error?: string;
    [x: string]: any;
}
export interface EstimateTxGasArgs {
    data: Address;
    to: Address;
    chainId: number;
    value?: string | bigint;
}

export interface IClients {
    wallet: ReturnType<
        typeof createWalletClient<CustomTransport | HttpTransport, Chain, JsonRpcAccount | LocalAccount, undefined>
    >;
    // wallet:
    //     | (
    //           | Awaited<ReturnType<typeof createModularAccountAlchemyClient<Web3AuthSigner>>>
    //           | WalletClient<CustomTransport, Chain, JsonRpcAccount>
    //       ) & {
    //           estimateTxGas: (args: EstimateTxGasArgs) => Promise<bigint>;
    //       };
    public: PublicClient<HttpTransport, Chain, undefined, undefined>;
}

export interface CrossChainTransactionObject {
    contractCall: {
        value: bigint;
        data: Hex;
        to: Address;
        outputTokenAddress: Address;
    };
    balances: Balances;
    currentWallet: Address;
    toChainId: number;
    toToken: Address;
    toTokenAmount: bigint;
    max?: boolean;
    simulate?: boolean;
    notificationId?: string;
    getPublicClient: (chainId: number) => IClients["public"];
    getWalletClient: (chainId: number) => Promise<IClients["wallet"]>;
}

export interface CrossChainBridgeWithdrawObject {
    currentWallet: Address;
    toChainId: number;
    fromChainId: number;
    fromAmount: bigint;
    fromToken: Address;
    toToken: Address;
    notificationId?: string;
    getPublicClient: (chainId: number) => IClients["public"];
    getWalletClient: (chainId: number) => Promise<IClients["wallet"]>;
}
