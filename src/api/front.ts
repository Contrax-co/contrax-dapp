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
        let url = `/api/v1/cataloglink?userId=${userAddress}&enableTransfers=true`;
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
            ],
        });
        return res.data.content.iFrameUrl;
    } catch (error) {
        console.error(error);
    }
};

const formatHoldings = (holdings: { symbol: string; amount: number }[]) => {
    const tokens: {
        chainId: number;
        address: string;
        symbol: string;
        decimals: number;
        balance: number;
        logo: string;
    }[] = [];

    holdings?.forEach((element) => {
        switch (element.symbol) {
            case "ETH":
                tokens.push({
                    chainId: CHAIN_ID.MAINNET,
                    address: constants.AddressZero,
                    symbol: "ETH",
                    decimals: 18,
                    balance: element.amount,
                    logo: "https://raw.githubusercontent.com/Contrax-co/tokens/main/arbitrum-tokens/0x82aF49447D8a07e3bd95BD0d56f35241523fBab1/logo.png",
                });
                break;
            case "USDC":
                tokens.push({
                    chainId: CHAIN_ID.POLYGON,
                    address: addressesByChainId[CHAIN_ID.POLYGON].usdcAddress,
                    symbol: "USDC",
                    decimals: 6,
                    balance: element.amount,
                    logo: "https://raw.githubusercontent.com/Contrax-co/tokens/main/arbitrum-tokens/0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8/logo.png",
                });
                break;
            case "MATIC":
                tokens.push({
                    chainId: CHAIN_ID.POLYGON,
                    address: constants.AddressZero,
                    symbol: "MATIC",
                    decimals: 18,
                    balance: element.amount,
                    logo: "https://cryptologos.cc/logos/polygon-matic-logo.png?v=025",
                });
                break;
        }
    });
    return tokens;
};

export const getHoldings = async (authToken: string, type: string, userAddress: string) => {
    try {
        const res = await frontApi.post("/api/v1/holdings/get", {
            authToken,
            type,
        });
        const content = res.data.content as {
            status: string;
            cryptocurrencyPositions: {
                symbol: string;
                amount: number;
            }[];
        };

        console.log("holdings", content);
        return formatHoldings(content.cryptocurrencyPositions);
    } catch (error) {
        console.error(error);
        return [];
    }
};

export const executeTransfer = async (args: {
    authToken: string;
    data: string;
    targetAddress: string;
    amount: number;
    fee: number;
    chain: string;
    symbol: string;
    type: string;
    mfaCode?: string;
    chainId: number;
}) => {
    type Response = {
        content: {
            transaction?: {
                hash: string;
            };
            status?: string;
        };
    };
    try {
        const res = await frontApi.post<Response>("/api/v1/transfers", args);

        if (res.data.content.status === "mfaRequired") {
            return {
                status: "mfaRequired",
            };
        }

        if (!res.data.content.transaction?.hash) {
            return {
                status: "failed",
            };
        }

        const res3 = await waitForTransaction({
            chainId: args.chainId,
            hash: res.data.content.transaction.hash as `0x${string}`,
        });

        if (res3.status) {
            return { status: "success" };
        } else {
            return { status: "failed" };
        }
    } catch (error) {
        return { status: "failed" };
    }
};

export const getLinkToken = async (userId: string) => {
    try {
        const res = await frontApi.post("/api/v1/linkToken", {
            userId,
            transferOptions: {
                toAddresses: [
                    {
                        networkId: "a34f2431-0ddd-4de4-bc22-4a8143287aeb",
                        symbol: "USDC",
                        address: userId,
                    },
                ],
            },
            fundingOptions: {
                enabled: true,
            },
        });
        return res.data?.content?.linkToken as string;
    } catch (error) {
        return { status: "failed" };
    }
};
