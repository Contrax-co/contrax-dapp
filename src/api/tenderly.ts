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
    TraceTransactionResponse,
} from "src/types/tenderly";
import { Address, createPublicClient, Hex, http, parseUnits, zeroAddress } from "viem";
import { defaultChainId, TENDERLY_ACCESS_TOKEN, tenderlyRpcs } from "src/config/constants";
import { CHAIN_ID } from "src/types/enums";

// #region Utility functions
const mapStateOverridesToEncodeStateRequest = (
    overrides: SimulationParametersOverrides,
    chainId: number
): EncodeStateRequest => {
    return {
        networkID: chainId.toString(),
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
                [`allowance[${item.owner.toLowerCase()}][${item.spender.toLowerCase()}]`]:
                    "115792089237316195423570985008687907853269984665640564039457584007913129639935",
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

export const getTokenBalanceStateOverride = (data: { tokenAddress: string; owner: string; balance?: string }) => {
    let overrides: SimulationParametersOverrides = {};
    const max = "115792089237316195423570985008687907853269984665640564039457584007913129639935";
    overrides[data.tokenAddress.toLowerCase()] = {
        state: {
            [`balanceAndBlacklistStates[${data.owner.toLowerCase()}]`]: data.balance || max,
            [`balances[${data.owner.toLowerCase()}]`]: data.balance || max,
            [`_balances[${data.owner.toLowerCase()}]`]: data.balance || max,
        },
    };
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

export const encodeStateOverrides = async (
    overrides: SimulationParametersOverrides,
    chainId: number = defaultChainId
) => {
    const encodingRequest = mapStateOverridesToEncodeStateRequest(overrides, chainId);
    const res = await tenderlyApi.post(
        `contracts/encode-states
      `,
        encodingRequest
    );
    const encodedStates = res.data;
    console.log(encodedStates);
    const result = mapToEncodedOverrides(encodedStates?.stateOverrides || {});
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

    return { before: BigInt(change?.original || 0), after: BigInt(change?.dirty || 0) };
};

// #endregion Utility functions

export const simulateTransaction = async (
    data: Omit<
        TenderlySimulateTransactionBody,
        "network_id" | "save" | "save_if_fails" | "simulation_type" | "state_objects"
    > & { chainId?: number }
): Promise<SimulationResponse> => {
    const body: TenderlySimulateTransactionBody = {
        state_objects: {},
        ...data,
        network_id: `${data.chainId || Network.ARBITRUM_ONE}`,
    };

    if (data.state_overrides) {
        const overrides = await encodeStateOverrides(data.state_overrides, data.chainId);
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
    if (data.balance_overrides) {
        Object.entries(data.balance_overrides).forEach(([address, newBalance]) => {
            // @ts-ignore
            Object.assign(body.state_objects, {
                [address]: {
                    balance: newBalance,
                },
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

export const traceTransactionAssetChange = async (args: {
    chainId: number;
    txHash: Hex;
    tokenAddress?: Address;
    walletAddress?: Address;
}) => {
    // @ts-ignore
    let rpc = tenderlyRpcs[chainId];
    const publicClient = createPublicClient({
        transport: http(rpc),
    });
    const res: TraceTransactionResponse = await publicClient.request({
        // @ts-expect-error
        method: "tenderly_traceTransaction",
        params: [args.txHash],
    });

    if (args.tokenAddress === zeroAddress) {
        const walletChange = res.stateChanges.find(
            (item) => item.address.toLowerCase() === args.walletAddress?.toLowerCase()
        );
        if (walletChange) {
            const newValue = BigInt(walletChange.balance.newValue);
            const previousValue = BigInt(walletChange.balance.previousValue);
            return {
                before: previousValue,
                after: newValue,
                difference: newValue - previousValue,
            };
        }
    } else {
        const assetChange = res.assetChanges?.find(
            (item) =>
                item.assetInfo.contractAddress?.toLowerCase() === args.tokenAddress?.toLowerCase() &&
                item.to?.toLowerCase() === args.walletAddress?.toLowerCase()
        );
        if (assetChange) {
            const amount = BigInt(assetChange.rawAmount || 0);
            return {
                before: undefined,
                after: undefined,
                difference: amount,
            };
        }
    }
};
