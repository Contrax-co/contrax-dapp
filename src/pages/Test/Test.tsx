import { useState, useMemo, useEffect, useRef } from "react";
import useNotify from "src/hooks/useNotify";
import { commify } from "ethers/lib/utils.js";
import { usePlatformTVL } from "src/hooks/usePlatformTVL";
import useWallet from "src/hooks/useWallet";
import SlippageModal from "src/components/modals/SlippageModal/SlippageModal";
import SuccessfulEarnTrax from "src/components/modals/SuccessfulEarnTrax/SuccessfulEarnTrax";
import { addressesByChainId } from "src/config/constants/contracts";
import { CHAIN_ID } from "src/types/enums";
import {
    Address,
    encodeFunctionData,
    encodePacked,
    erc20Abi,
    getContract,
    Hex,
    hexToString,
    keccak256,
    maxUint256,
    parseEther,
    parseUnits,
    toFunctionSignature,
    zeroAddress,
} from "viem";
import useVaultMigrate from "src/hooks/useVaultMigrate";
import { convertQuoteToRoute, getContractCallsQuote, getStatus } from "@lifi/sdk";
import steerZapperAbi from "src/assets/abis/steerZapperAbi";
import { awaitTransaction, toWei } from "src/utils/common";
import { approveErc20, getBalance } from "src/api/token";
import { buildTransaction, getBridgeStatus, getRoute } from "src/api/bridge";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useConnectors } from "wagmi";
import Bridge from "../../utils/Bridge";
import usePriceOfTokens from "src/hooks/usePriceOfTokens";
import { getAllowanceSlot } from "src/config/constants/storageSlots";
// import { createModularAccountAlchemyClient } from "@alchemy/aa-alchemy";
// import { LocalAccountSigner, arbitrum } from "@alchemy/aa-core";
// import { createWeb3AuthSigner } from "src/config/walletConfig";

const Test = () => {
    const { openConnectModal } = useConnectModal();
    const { currentWallet, getWalletClient, getPublicClient } = useWallet();
    const connectors = useConnectors();
    const { dismissNotifyAll, notifyError, notifyLoading, notifySuccess } = useNotify();
    const [url, setUrl] = useState<string>("");
    const [modelOpen, setModelOpen] = useState(false);
    const [model1Open, set1ModelOpen] = useState(false);
    const { connectWallet, switchExternalChain, getClients } = useWallet();
    const { prices } = usePriceOfTokens();
    const { platformTVL } = usePlatformTVL();
    const clickMeButtonRef = useRef<HTMLButtonElement>(null);

    const { migrate } = useVaultMigrate();

    const fn = async () => {
        // setModelOpen(true);
        const tokenAddress = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";
        const owner = "0x2f1eA3b412862f3a6a81CB575504D7A2c8e5bC30";
        const spender = "0x53b0705194e686Ba745eF8A80cB1Ef355dE645D0";
        const publicClient = getPublicClient(CHAIN_ID.ARBITRUM);
        const allowance = await publicClient.readContract({
            address: tokenAddress,
            abi: erc20Abi,
            functionName: "allowance",
            args: [owner, spender],
        });
        console.log("allowance =>", allowance);
        for (let i = 0; i < 100; i++) {
            const slot = keccak256(
                encodePacked(
                    ["uint256", "uint256"],
                    [
                        BigInt(spender),
                        BigInt(keccak256(encodePacked(["uint256", "uint256"], [BigInt(owner), BigInt(i)]))),
                    ]
                )
            );
            console.log("slot =>", i, slot);
            // console.log("i =>", i);
            // const slot = keccak256(
            //     encodePacked(
            //         ["uint256", "uint256"],
            //         [
            //             BigInt(spender),
            //             BigInt(keccak256(encodePacked(["uint256", "uint256"], [BigInt(owner), BigInt(i)]))),
            //         ]
            //     )
            // );
            // const res = await publicClient.getStorageAt({
            //     address: tokenAddress,
            //     slot: slot,
            // });
            // console.log("res =>", res);
            // if (BigInt(res!) === allowance) {
            //     console.log("Matched", i);
            //     console.log("slot", slot);
            //     break;
            // }
        }
    };

    return (
        <div style={{ color: "red" }}>
            {/* <SlippageModal
                handleClose={() => {
                    // setShowSlippageModal(false);
                }}
                handleSubmit={() => {}}
                percentage={12}
            /> */}
            Test
            <button onClick={fn} ref={clickMeButtonRef}>
                Click Me
            </button>
            <button onClick={() => migrate()}>Migrate</button>
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
            <button
                onClick={() => {
                    setModelOpen(true);
                }}
            >
                warning modal open
            </button>
            <button
                onClick={() => {
                    setModelOpen(true);
                }}
            >
                slippage model open
            </button>
            <button
                onClick={() => {
                    set1ModelOpen(true);
                }}
            >
                COngras modal open
            </button>
            <br />
            {platformTVL && <h1>Platform TVL: ${commify(platformTVL.toFixed(0))}</h1>}
            <iframe src={url} style={{ width: 400, height: 700 }}></iframe>
        </div>
    );
};

export default Test;
