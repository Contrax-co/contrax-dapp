import { useState } from "react";
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
import useBridge from "src/hooks/bridge/useBridge";
import { commify } from "ethers/lib/utils.js";
import { useAppDispatch } from "src/state";
import { setSourceTxHash } from "src/state/ramp/rampReducer";
import { getRoute } from "src/api/bridge";
import { CHAIN_ID } from "src/types/enums";
import { toWei } from "src/utils/common";
import { useDecimals } from "src/hooks/useDecimals";
import { getReferalEarning } from "src/api/account";
import { getCatalogLink } from "src/api/front";
import { usePlatformTVL } from "src/hooks/usePlatformTVL";
import useSwapUsdcNative from "src/hooks/useSwapUsdcNative";

const Test = () => {
    const { dismissNotifyAll, notifyError, notifyLoading, notifySuccess } = useNotify();
    const addRecentTransaction = useAddRecentTransaction();
    const dispatch = useAppDispatch();
    const { currentWallet } = useWallet();
    const { decimals } = useDecimals();
    const [url, setUrl] = useState<string>("");
    const { platformTVL } = usePlatformTVL();

    // web3authProvider
    const handleTransaction = async () => {};

    const fn = async () => {
        // tenderly.simulator.simulateTransaction({
        //   transaction:{
        //   }
        // })
    };

    return (
        <div style={{ color: "red" }}>
            Test
            <button onClick={fn}>Tenderly simulate</button>
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
            <br />
            {platformTVL && <h1>Platform TVL: ${commify(platformTVL.toFixed(0))}</h1>}
            <iframe src={url} style={{ width: 400, height: 700 }}></iframe>
        </div>
    );
};

export default Test;
