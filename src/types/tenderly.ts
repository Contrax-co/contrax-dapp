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

export interface SimulationResponse {
    status: boolean;
    value: BigNumber;
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
}
