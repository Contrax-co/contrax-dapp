import axios from "axios";
import {
    Tenderly,
    Network,
    SimulationParametersOverrides,
    EncodedStateOverride,
    EncodeStateRequest,
    StateOverride,
} from "@tenderly/sdk";

import {
    BACKEND_BASE_URL,
    SOCKET_API_KEY,
    TENDERLY_ACCESS_TOKEN,
    TENDERLY_PROJECT_SLUG,
    TENDERLY_USER_NAME,
} from "src/config/constants";

export const backendApi = axios.create({
    // baseURL: "http://localhost:8000/api/v1/",
    baseURL: BACKEND_BASE_URL,
});

export const isGasSponsored = async (addr: string): Promise<boolean> => {
    const res = await backendApi.get("/settings/should-sponsor?walletAddress=" + addr);
    return res.data.data.willSponsor;
};

export const tenderlyApi = axios.create({
    baseURL: `https://api.tenderly.co/api/v1/account/${TENDERLY_USER_NAME}/project/${TENDERLY_PROJECT_SLUG}/`,
    headers: {
        "X-Access-Key": TENDERLY_ACCESS_TOKEN,
    },
});

export const socketTechApi = axios.create({
    baseURL: `https://api.socket.tech/v2/`,
    headers: {
        "API-KEY": SOCKET_API_KEY,
        // Testing key
        // "API-KEY": "645b2c8c-5825-4930-baf3-d9b997fcd88c",
    },
});

export const tenderly = new Tenderly({
    accessKey: TENDERLY_ACCESS_TOKEN!,
    accountName: TENDERLY_USER_NAME!,
    projectName: TENDERLY_PROJECT_SLUG!,
    network: Network.ARBITRUM_ONE,
});
