import json from "src/config/constants/pools.json";
import { Contract, Signer, Wallet, providers, constants, ethers, utils, BytesLike } from "ethers";
import useWallet from "src/hooks/useWallet";
import useNotify from "src/hooks/useNotify";
import { erc20ABI, useAccount, useConnect, useDisconnect, useSigner, useSwitchNetwork } from "wagmi";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { GasSponsoredSigner } from "src/utils/gasSponsoredSigner";
import { socketTechApi, tenderly, tenderlyApi } from "src/api";
import { addressesByChainId } from "src/config/constants/contracts";
import { defaultChainId } from "src/config/constants";
import { filterStateDiff, getAllowanceStateOverride, simulateTransaction } from "src/api/tenderly";
import { TenderlySimulationType } from "src/types/tenderly";
import { approveErc20, checkApproval } from "src/api/token";
import useBridge from "src/hooks/useBridge";
import useTVL from "src/hooks/useTVL";
import { commify } from "ethers/lib/utils.js";
import { useAppDispatch } from "src/state";
import { setSourceTxHash } from "src/state/ramp/rampReducer";
import { getRoute } from "src/api/bridge";
import { CHAIN_ID } from "src/types/enums";
import { toWei } from "src/utils/common";
import { useDecimals } from "src/hooks/useDecimals";

const Test = () => {
    const { dismissNotifyAll, notifyError, notifyLoading, notifySuccess } = useNotify();
    const addRecentTransaction = useAddRecentTransaction();
    const { polyUsdcToUsdc } = useBridge();
    const dispatch = useAppDispatch();
    const { currentWallet } = useWallet();
    const { decimals } = useDecimals();
    const { platformTVL } = useTVL();

    // web3authProvider
    const handleTransaction = async () => {};

    const fn = async () => {
        // const blockNumber = await provider.getBlockNumber();
        // const overrideInput = await encodeStateOverrides({
        //     [addressesByChainId[defaultChainId].usdcAddress]: {
        //         state: {
        //             [`_allowances[[${"0x5C70387dbC7C481dbc54D6D6080A5C936a883Ba8"}][${"0x80957FaBaC43427639a875A44156fbE35081c7f9"}]`]:
        //                 "115792089237316195423570985008687907853269984665640564039457584007913129639935",
        //         },
        //     },
        // });
        // console.log(overrideInput);
        // if (!overrideInput) return;
        // const simRes = await tenderly.simulator.simulateTransaction({
        //     blockNumber,
        //     transaction: {
        //         /* Standard EVM Transaction object */
        //         from: "0x5C70387dbC7C481dbc54D6D6080A5C936a883Ba8",
        //         to: "0x80957FaBaC43427639a875A44156fbE35081c7f9",
        //         input: "0x72f8b6cd000000000000000000000000fd3573bebdc8bf323c65edf2408fd9a8412a86940000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ff970a61a04b1ca14834a43f5de4533ebddb5cc8000000000000000000000000000000000000000000000000000000000020319d",
        //         gas: 8000000,
        //         gas_price: "0",
        //         value: 0,
        //     },
        //     overrides: {
        //         [addressesByChainId[defaultChainId].usdcAddress]: {
        //             state: {
        //                 [`_allowances[${"0x5C70387dbC7C481dbc54D6D6080A5C936a883Ba8"}][${"0x80957FaBaC43427639a875A44156fbE35081c7f9"}]`]:
        //                     "115792089237316195423570985008687907853269984665640564039457584007913129639935",
        //             },
        //             nonce: 10000,
        //         },
        //     },
        // });
        // console.log("simRes", simRes);
        // const res = await tenderlyApi.post("simulate", {
        //     /* Simulation Configuration */
        //     save: false, // if true simulation is saved and shows up in the dashboard
        //     save_if_fails: false, // if true, reverting simulations show up in the dashboard
        //     simulation_type: "full", // full or quick (full is default)
        //     network_id: "42161", // network to simulate on
        //     /* Standard EVM Transaction object */
        //     from: "0x5C70387dbC7C481dbc54D6D6080A5C936a883Ba8",
        //     to: "0x80957FaBaC43427639a875A44156fbE35081c7f9",
        //     input: "0x72f8b6cd000000000000000000000000fd3573bebdc8bf323c65edf2408fd9a8412a86940000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ff970a61a04b1ca14834a43f5de4533ebddb5cc8000000000000000000000000000000000000000000000000000000000020319d",
        //     // from: "0x5C70387dbC7C481dbc54D6D6080A5C936a883Ba8",
        //     // to: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
        //     // input: "0xa9059cbb0000000000000000000000005c70387dbc7c481dbc54d6d6080a5c936a883ba8000000000000000000000000000000000000000000000000000000000020319d",
        //     // gas: 8000000,
        //     // gas_price: 0,
        //     value: 0,
        //     state_objects: {
        //         [addressesByChainId[defaultChainId].usdcAddress.toLowerCase()]: {
        //             storage: {
        //                 ...overrideInput[addressesByChainId[defaultChainId].usdcAddress.toLowerCase()],
        //             },
        //         },
        //     },
        // });
        // console.log(res.data);
        // console.log(res.data.transaction.transaction_info);
        // console.log("Status: ", res.data.simulation.status);
        // console.log("Eth value :", res.data.transaction.value);
        // console.log("Method called: ", res.data.transaction.transaction_info?.method);
        // console.log(
        //     "Logs :",
        //     res.data.transaction.transaction_info?.logs?.map((item: any) => ({
        //         name: item.name,
        //         inputs: item.inputs.map((input: any) => ({
        //             value: input.value,
        //             name: input.soltype.name,
        //             type: input.soltype.type,
        //         })),
        //     }))
        // );
        // console.log(
        //     "state_diff",
        //     res.data.transaction.transaction_info?.state_diff?.map((item: any) => ({
        //         name: item?.soltype?.name,
        //         type: item?.soltype?.type,
        //         original: item?.original,
        //         afterChange: item?.dirty,
        //         address: item?.address,
        //     }))
        // );
        // const filterStateDiff = (contractAddress: string, variableName: string, state_diffs: any[]) => {
        //     contractAddress = contractAddress.toLowerCase();
        //     return state_diffs
        //         .map((item: any) => ({
        //             name: item?.soltype?.name,
        //             type: item?.soltype?.type,
        //             original: item?.original,
        //             afterChange: item?.dirty,
        //             address: item?.address,
        //         }))
        //         .filter((item: any) => item.address === contractAddress && item.name === variableName)[0];
        // };
        // console.log(
        //     "filtered",
        //     filterStateDiff(
        //         "0xfd3573bebDc8bF323c65Edf2408Fd9a8412a8694",
        //         "_balances",
        //         res.data.transaction.transaction_info?.state_diff
        //     )
        // );
    };

    const fn2 = async () => {
        const simulationResult = await simulateTransaction({
            /* Standard EVM Transaction object */
            from: "0x5C70387dbC7C481dbc54D6D6080A5C936a883Ba8",
            to: "0x80957FaBaC43427639a875A44156fbE35081c7f9",
            input: "0x72f8b6cd000000000000000000000000fd3573bebdc8bf323c65edf2408fd9a8412a86940000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ff970a61a04b1ca14834a43f5de4533ebddb5cc8000000000000000000000000000000000000000000000000000000000020319d",

            state_overrides: getAllowanceStateOverride([
                {
                    tokenAddress: addressesByChainId[defaultChainId].usdcAddress,
                    owner: "0x5C70387dbC7C481dbc54D6D6080A5C936a883Ba8",
                    spender: "0x80957FaBaC43427639a875A44156fbE35081c7f9",
                },
            ]),
        });

        const filteredState = filterStateDiff(
            "0xfd3573bebDc8bF323c65Edf2408Fd9a8412a8694",
            "_balances",
            simulationResult.stateDiffs
        );

        console.log(filteredState);
    };
    const testRouteBridge = async () => {
        await getRoute(
            CHAIN_ID.POLYGON,
            CHAIN_ID.ARBITRUM,
            addressesByChainId[CHAIN_ID.POLYGON].usdcAddress,
            addressesByChainId[CHAIN_ID.ARBITRUM].usdcAddress,
            toWei("1", decimals[addressesByChainId[CHAIN_ID.ARBITRUM].usdcAddress]).toString(),
            "0x5C70387dbC7C481dbc54D6D6080A5C936a883Ba8"
        );
    };

    const bridgeFn = async () => {
        await polyUsdcToUsdc();
    };
    return (
        <div style={{ color: "red" }}>
            Test
            <button
                onClick={() =>
                    dispatch(setSourceTxHash("0xb31a3b7e617367def8fe92af3ca09c80080bd62db5eed87e6cc21da44bf79159"))
                }
            >
                SetBridgeTxHash
            </button>
            <button onClick={fn2}>Simulate</button>
            <button onClick={bridgeFn}>Bridge</button>
            <button
                onClick={() => {
                    notifySuccess("Approving Zapping!", "Please wait...a sadasfas fsa fsafsafsaf saf");
                }}
            >
                success long
            </button>
            <button
                onClick={() => {
                    notifySuccess("Approving Zapping!", "Please wait...");
                }}
            >
                success
            </button>
            <button
                onClick={() => {
                    notifyError("Approving Zapping!", "Please wait...");
                }}
            >
                error
            </button>
            <button
                onClick={() => {
                    notifyError(
                        "Approving Zapping!",
                        "Please wait...ssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss"
                    );
                }}
            >
                error long
            </button>
            <button
                onClick={() => {
                    notifyLoading("Approving Zapping!", "Please wait...");
                }}
            >
                loading
            </button>
            <button
                onClick={() => {
                    notifyLoading("Approving Zapping!", "Please wait...", {
                        buttons: [
                            {
                                name: "View",
                                onClick: () => {},
                            },
                        ],
                    });
                }}
            >
                btns
            </button>
            <button
                onClick={() => {
                    dismissNotifyAll();
                }}
            >
                dismiss
            </button>
            <button onClick={testRouteBridge}>get route</button>
            <br />
            <h1>Platform TVL: ${commify(platformTVL.toFixed(0))}</h1>
        </div>
    );
};

export default Test;
