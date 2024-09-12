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
    SNAPSHOT_GRAPHQL_URL,
    SOCKET_API_KEY,
    TENDERLY_ACCESS_TOKEN,
    TENDERLY_PROJECT_SLUG,
    TENDERLY_USER_NAME,
} from "src/config/constants";
import { Address, Hex } from "viem";

export const backendApi = axios.create({
    // baseURL: "http://localhost:8000/api/v1/",
    baseURL: BACKEND_BASE_URL,
});

export const snapshotApi = axios.create({
    baseURL: SNAPSHOT_GRAPHQL_URL,
});

export const isGasSponsored = async (addr: string): Promise<boolean> => {
    const res = await backendApi.get("/settings/should-sponsor?walletAddress=" + addr);
    return res.data.data.willSponsor;
};

export const requestEthForGas = async (params: {
    from: Address;
    to: Address;
    chainId: number;
    data: Hex;
    value?: bigint;
    ethAmountForGas: bigint;
}) => {
    const res = await backendApi.post("/transaction/send-eth-for-sponsored-tx", {
        from: params.from,
        to: params.to,
        chainId: params.chainId,
        data: params.data,
        value: params.value?.toString(),
        ethAmountForGas: params.ethAmountForGas.toString(),
    });
    return res.data.status as boolean;
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
    },
});

export const traxApi = axios.create({
    baseURL: `${BACKEND_BASE_URL}account/terms/trax/`,
});

export const tenderly = new Tenderly({
    accessKey: TENDERLY_ACCESS_TOKEN!,
    accountName: TENDERLY_USER_NAME!,
    projectName: TENDERLY_PROJECT_SLUG!,
    network: Network.ARBITRUM_ONE,
});
