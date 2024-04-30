import {
    Network,
    SimulationParametersOverrides,
    EncodedStateOverride,
    EncodeStateRequest,
    StateOverride,
} from "@tenderly/sdk";
import { tenderlyApi } from ".";
import {
    AssetChanges,
    BalanceDiffs,
    FilteredStateDiff,
    SimulationResponse,
    TenderlySimulateTransactionBody,
} from "src/types/tenderly";
import { zeroAddress } from "viem";

// #region Utility functions
const mapStateOverridesToEncodeStateRequest = (overrides: SimulationParametersOverrides): EncodeStateRequest => {
    return {
        networkID: `${Network.ARBITRUM_ONE}`,
        stateOverrides: Object.keys(overrides)
            .map((contractAddress) => ({
                [contractAddress]: overrides[contractAddress as string].state,
            }))
            .map((x) => {
                const y = {};
                Object.keys(x).forEach((key) => {
                    // @ts-ignore
                    y[key] = { value: x[key] };
                });
                return y;
            })
            .reduce((acc, curr) => ({ ...acc, ...curr })),
    };
};

export const getAllowanceStateOverride = (data: { tokenAddress: string; owner: string; spender: string }[]) => {
    let overrides: SimulationParametersOverrides = {};

    data.forEach((item) => {
        overrides[item.tokenAddress.toLowerCase()] = {
            state: {
                [`_allowances[${item.owner.toLowerCase()}][${item.spender.toLowerCase()}]`]:
                    "115792089237316195423570985008687907853269984665640564039457584007913129639935",
                [`allowances[${item.owner.toLowerCase()}][${item.spender.toLowerCase()}]`]:
                    "115792089237316195423570985008687907853269984665640564039457584007913129639935",
                [`allowed[${item.owner.toLowerCase()}][${item.spender.toLowerCase()}]`]:
                    "115792089237316195423570985008687907853269984665640564039457584007913129639935",
            },
        };
    });

    return overrides;
};

const mapToEncodedOverrides = (stateOverrides: StateOverride): EncodedStateOverride => {
    return Object.keys(stateOverrides)
        .map((address) => address.toLowerCase())
        .reduce((acc, curr) => {
            // @ts-ignore
            acc[curr] = stateOverrides[curr].value;
            return acc;
        }, {});
};

export const encodeStateOverrides = async (overrides: SimulationParametersOverrides) => {
    const encodingRequest = mapStateOverridesToEncodeStateRequest(overrides);
    const res = await tenderlyApi.post(
        `contracts/encode-states
      `,
        encodingRequest
    );
    const encodedStates = res.data;
    console.log(encodedStates);
    const result = mapToEncodedOverrides(encodedStates.stateOverrides);
    console.log(result);
    return result;
};

export const filterStateDiff = (
    contractAddress: string,
    variableName: string,
    state_diffs: any[]
): FilteredStateDiff => {
    contractAddress = contractAddress.toLowerCase();
    return state_diffs.filter((item: any) => item.address === contractAddress && item.name === variableName)[0];
};

export const filterAssetChanges = (tokenAddress: string, walletAddress: string, assetChanges: AssetChanges[]) => {
    let added = BigInt(0);
    let subtracted = BigInt(0);
    assetChanges.forEach((item) => {
        if (!item.token_info.contract_address) item.token_info.contract_address = zeroAddress;
        if (item.token_info.contract_address.toLowerCase() === tokenAddress.toLowerCase()) {
            if (!item?.to) item.to = zeroAddress;
            if (!item?.from) item.from = zeroAddress;
            if (item.from.toLowerCase() === walletAddress.toLowerCase()) {
                subtracted += BigInt(item.raw_amount);
            }
            if (item.to.toLowerCase() === walletAddress.toLowerCase()) {
                added += BigInt(item.raw_amount);
            }
        }
    });

    return { added, subtracted, difference: added - subtracted };
};

export const filterBalanceChanges = (walletAddress: string, balanceChanges: BalanceDiffs[]) => {
    const change = balanceChanges.find((item) => item.address.toLowerCase() === walletAddress.toLowerCase());

    return { before: change?.original, after: change?.dirty };
};

// #endregion Utility functions

export const simulateTransaction = async (
    data: Omit<
        TenderlySimulateTransactionBody,
        "network_id" | "save" | "save_if_fails" | "simulation_type" | "state_objects"
    >
): Promise<SimulationResponse> => {
    const body: TenderlySimulateTransactionBody = {
        state_objects: {},
        ...data,
        network_id: `${Network.ARBITRUM_ONE}`,
    };

    // State overiding api is not working hence, commented
    // TODO: uncomment when fixed
    if (data.state_overrides) {
        const overrides = await encodeStateOverrides(data.state_overrides);
        const contractAddress = Object.keys(overrides);
        const encodedState = contractAddress.map((addr) => ({
            [addr]: {
                storage: {
                    ...overrides[addr],
                },
            },
        }));
        encodedState.forEach((x) => {
            Object.keys(x).forEach((key: string) => {
                // @ts-ignore
                body.state_objects[key] = x[key];
            });
        });
    }

    const res = await tenderlyApi.post("simulate", body);
    let processedResponse = {
        status: res.data.simulation.status as boolean,
        value: BigInt(res.data.transaction.value + "0"),
        method: res.data.transaction.transaction_info?.method as string,
        gasUsed: res.data.transaction?.gas_used as number,
        logs: res.data.transaction.transaction_info?.logs?.map((item: any) => ({
            name: item.name,
            inputs: item.inputs?.map((input: any) => ({
                value: input.value,
                name: input.soltype.name,
                type: input.soltype.type,
            })),
        })),
        stateDiffs: res.data.transaction.transaction_info?.state_diff?.map((item: any) => ({
            name: item?.soltype?.name,
            type: item?.soltype?.type,
            original: item?.original,
            afterChange: item?.dirty,
            address: item?.address,
        })),
        assetChanges: res.data.transaction.transaction_info.asset_changes,
        balanceDiff: res.data.transaction.transaction_info.balance_diff,
    };

    return processedResponse;
};
