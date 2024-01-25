import { SimulationParametersOverrides } from "@tenderly/sdk";
import { BigNumber } from "ethers";

export enum TenderlySimulationType {
    Full = "full",
    Quick = "quick",
}

export interface TenderlySimulateTransactionBody {
    /**
     * If true simulation is saved and shows up in the dashboard
     */
    save?: boolean;
    /**
     * If true, reverting simulations show up in the dashboard
     */
    save_if_fails?: boolean;
    /**
     * Full or Quick transactions,
     * Default: full
     */
    simulation_type?: TenderlySimulationType;
    /**
     * Network to simulate on
     */
    network_id?: string;

    /**
     * Transaction parameters, from address
     */
    from: string;
    /**
     * Transaction parameters, to address
     */
    to: string;
    /**
     * Transaction parameters, input data from encoded function call or populate transaction data
     */
    input: string;
    gas?: number;
    gas_price?: number;
    value?: string;

    state_overrides?: SimulationParametersOverrides;

    state_objects?: {
        [key: string]: {
            storage: {
                [key: string]: string;
            };
        };
    };
}

export interface FilteredStateDiff {
    name: string;
    type: string;
    original: any;
    afterChange: any;
    address: string;
}

export interface AssetChanges {
    amount: string;
    dollar_value: string;
    from: string;
    raw_amount: string;
    to: string;
    type: string;
    token_info: {
        contract_address: string;
        decimals: number;
        dollar_value: string;
        logo: string;
        name: string;
        standard: string;
        symbol: string;
        type: string;
    };
}

export interface BalanceDiffs {
    address: string;
    dirty: string;
    is_miner: boolean;
    original: string;
}


export interface SimulationResponse {
    status: boolean;
    value: bigint;
    method: string;
    gasUsed: number;
    logs: {
        name: string;
        inputs: {
            value: string;
            name: string;
            type: string;
        }[];
    }[];
    stateDiffs: FilteredStateDiff[];
    assetChanges: AssetChanges[];
    balanceDiff: BalanceDiffs[];
}
