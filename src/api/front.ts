import axios from "axios";
import { FRONT_API_KEY, FRONT_CLIENT_ID, FRONT_URL, isDev } from "src/config/constants";
import { addressesByChainId } from "src/config/constants/contracts";
import { CHAIN_ID } from "src/types/enums";
import { constants } from "ethers";

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
                {
                    networkId: "e3c7fdd8-b1fc-4e51-85ae-bb276e075611",
                    symbol: "ETH",
                    address: userAddress,
                },
            ],
        });
        return res.data.content.iFrameUrl.replace("'", "");
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
                        });
                    } else if (element.symbol === "MATIC") {
                        tokens.push({
                            chainId: CHAIN_ID.POLYGON,
                            address: constants.AddressZero,
                            symbol: "MATIC",
                            decimals: 18,
                            balance: element.availableBalance,
                            usdAmount: element.availableBalanceInFiat,
                        });
                    }
                }
            }
        });
    });
    return tokens;
};

export const getHoldings = async (fromAuthToken: string, fromType: string, userAddress:string) => {
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

        return formatHoldings(content.holdings);
    } catch (error) {
        console.error(error);
        return [];
    }
};
