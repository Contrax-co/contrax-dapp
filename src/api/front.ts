import axios from "axios";
import { FRONT_API_KEY, FRONT_CLIENT_ID, FRONT_URL } from "src/config/constants";

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
        // let res = await frontApi.get("/api/v1/transfers/managed/networks");
        // const {name: } = res.data.content.networks.find((net)=>net.name === "Polygon")
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

        let url = `/api/v1/cataloglink?userId=${userAddress}&enableTransfers=true&brokerType=${brokerTypes.join(
            "&brokerType="
        )}`;
        console.log(url);
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
        console.log(res.data, res.data.content.iFrameUrl.replace("'", ""));
        return res.data.content.iFrameUrl.replace("'", "");
    } catch (error) {
        console.error(error);
    }
};

export const getHoldings = async (authToken: string, type: string) => {
    try {
        const res = await frontApi.post("/api/v1/holdings/get", { authToken, type });
        return res.data.content as {
            status: string;
            errorMessage: string;
            displayMessage: string;
            equityPositions: unknown[];
            notSupportedEquityPositions: unknown[];
            notSupportedCryptocurrencyPositions: unknown[];
            cryptocurrencyPositions: {
                symbol: string;
                amount: number;
                costBasis: number;
            }[];

            nftPositions: unknown[];
            optionPositions: unknown[];
            type: string;
            accountId: string;
            institutionName: string;
            accountName: string;
        };
    } catch (error) {
        console.error(error);
    }
};
