import axios from "axios";
import { FRONT_API_KEY, FRONT_CLIENT_ID, FRONT_URL, defaultChainId, isDev } from "src/config/constants";
import { addressesByChainId } from "src/config/constants/contracts";
import { CHAIN_ID } from "src/types/enums";
import { constants } from "ethers";
import { waitForTransaction } from "@wagmi/core";

export const frontApi = axios.create({
    baseURL: FRONT_URL,
    headers: {
        "Content-Type": "application/json",
        "X-Client-Id": FRONT_CLIENT_ID,
        "X-Client-Secret": FRONT_API_KEY,
    },
});

export const getCatalogLink = async (userAddress: string) => {
    try {
        const { data } = await frontApi.get("/api/v1/transfers/managed/networks");
        console.log(data);
        const brokerTypes = [
            "gateIo",
            "coinbase",
            "binanceInternational",
            "huobi",
            "bitfinex",
            "okx",
            "binanceUs",
            "krakenDirect",
            "kraken",
            "robinhood",
        ];
        let url = `/api/v1/cataloglink?userId=${userAddress}`;
        if (isDev) {
            url += `&brokerType=${brokerTypes.join("&brokerType=")}`;
        }
        const res = await frontApi.post(url, {
            toAddresses: [
                {
                    networkId: "7436e9d0-ba42-4d2b-b4c0-8e4e606b2c12",
                    symbol: "MATIC",
                    address: userAddress,
                },
                {
                    networkId: "7436e9d0-ba42-4d2b-b4c0-8e4e606b2c12",
                    symbol: "USDC",
                    address: userAddress,
                },
                {
                    networkId: "e3c7fdd8-b1fc-4e51-85ae-bb276e075611",
                    symbol: "ETH",
                    address: userAddress,
                },
            ],
        });
        return res.data.content.iFrameUrl;
    } catch (error) {
        console.error(error);
    }
};

type Holdings = [
    {
        symbol: string;
        availableBalance: number;
        availableBalanceInFiat: number;
        eligibleForTransfer: boolean;
        networks: {
            name: string;
            id: string;
            eligibleForTransfer: boolean;
            toAddress: string;
        }[];
        ineligibilityReason?: string;
    }
];

const formatHoldings = (holdings: Holdings) => {
    const tokens: {
        chainId: number;
        address: string;
        symbol: string;
        decimals: number;
        balance: number;
        usdAmount: number;
        networkId: string;
        logo: string;
    }[] = [];

    holdings?.forEach((element) => {
        element.networks.forEach((network) => {
            if (network.eligibleForTransfer) {
                if (network.name === "Ethereum") {
                    tokens.push({
                        chainId: CHAIN_ID.MAINNET,
                        address: constants.AddressZero,
                        symbol: "ETH",
                        decimals: 18,
                        balance: element.availableBalance,
                        usdAmount: element.availableBalanceInFiat,
                        networkId: network.id,
                        logo: "https://raw.githubusercontent.com/Contrax-co/tokens/main/arbitrum-tokens/0x82aF49447D8a07e3bd95BD0d56f35241523fBab1/logo.png",
                    });
                } else if (network.name === "Polygon") {
                    if (element.symbol === "USDC") {
                        tokens.push({
                            chainId: CHAIN_ID.POLYGON,
                            address: addressesByChainId[CHAIN_ID.POLYGON].usdcAddress,
                            symbol: "USDC",
                            decimals: 6,
                            balance: element.availableBalance,
                            usdAmount: element.availableBalanceInFiat,
                            networkId: network.id,
                            logo: "https://raw.githubusercontent.com/Contrax-co/tokens/main/arbitrum-tokens/0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8/logo.png",
                        });
                    } else if (element.symbol === "MATIC") {
                        tokens.push({
                            chainId: CHAIN_ID.POLYGON,
                            address: constants.AddressZero,
                            symbol: "MATIC",
                            decimals: 18,
                            balance: element.availableBalance,
                            usdAmount: element.availableBalanceInFiat,
                            networkId: network.id,
                            logo: "https://cryptologos.cc/logos/polygon-matic-logo.png?v=025",
                        });
                    }
                }
            }
        });
    });
    return tokens;
};

export const getHoldings = async (fromAuthToken: string, fromType: string, userAddress: string) => {
    try {
        const res = await frontApi.post("/api/v1/transfers/managed/configure", {
            fromAuthToken,
            fromType,
            toAddresses: [
                {
                    networkId: "7436e9d0-ba42-4d2b-b4c0-8e4e606b2c12",
                    symbol: "MATIC",
                    address: userAddress,
                },
                {
                    networkId: "7436e9d0-ba42-4d2b-b4c0-8e4e606b2c12",
                    symbol: "USDC",
                    address: userAddress,
                },
                {
                    networkId: "e3c7fdd8-b1fc-4e51-85ae-bb276e075611",
                    symbol: "ETH",
                    address: userAddress,
                },
            ],
        });
        const content = res.data.content as {
            status: string;
            holdings: Holdings;
        };

        console.log("holdings", content);
        return formatHoldings(content.holdings);
    } catch (error) {
        console.error(error);
        return [];
    }
};

export const executeTransfer = async (args: {
    fromAuthToken: string;
    fromType: string;
    networkId: string;
    symbol: string;
    toAddress: string;
    amount: number;
}) => {
    try {
        const res = await frontApi.post<{
            content: {
                status: string;
                previewResult?: {
                    previewId: string;
                    previewExpiresIn: number;
                    fromAddress: string;
                    toAddress: string;
                    symbol: string;
                    amount: number;
                    amountInFiat: number;
                    totalEstimatedAmountInFiat: number;
                    networkId: string;
                    institutionTransferFee: {
                        fee: number;
                        feeCurrency: string;
                        feeInFiat: number;
                    };
                    estimatedNetworkGasFee: {
                        fee: number;
                        feeCurrency: string;
                        feeInFiat: number;
                    };
                };
            };
        }>("/api/v1/transfers/managed/preview", args);
        if (!res.data.content.previewResult) {
            throw new Error("No preview result");
        }
        const res2 = await frontApi.post<{
            content: {
                status: string;
                executeTransferResult: {
                    transferId: string;
                    status: "succeeded" | string;
                    statusDetails: "In progress" | string;
                    fromAddress: string;
                    toAddress: string;
                    symbol: string;
                    networkName: string;
                    networkId: string;
                    hash: string;
                    amount: number;
                    amountInFiat: number;
                    totalAmountInFiat: number;
                    completedConfirmations: number;
                    institutionTransferFee: {
                        fee: number;
                        feeCurrency: string;
                        feeInFiat: number;
                    };
                    networkGasFee: {
                        fee: number;
                        feeCurrency: string;
                        feeInFiat: number;
                    };
                };
            };
        }>("/api/v1/transfers/managed/execute", {
            fromAuthToken: args.fromAuthToken,
            fromType: args.fromType,
            previewId: res.data.content.previewResult?.previewId,
        });
        if (!res2.data.content.executeTransferResult.hash) {
            throw new Error("Transaction Error!");
        }

        const res3 = await waitForTransaction({
            chainId: defaultChainId,
            hash: res2.data.content.executeTransferResult.hash as `0x${string}`,
        });

        if (res3.status) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
};
