import { useState, useMemo, useEffect, useRef } from "react";
import useNotify from "src/hooks/useNotify";
import { commify } from "ethers/lib/utils.js";
import { usePlatformTVL } from "src/hooks/usePlatformTVL";
import useWallet from "src/hooks/useWallet";
import SlippageModal from "src/components/modals/SlippageModal/SlippageModal";
import SuccessfulEarnTrax from "src/components/modals/SuccessfulEarnTrax/SuccessfulEarnTrax";
import { addressesByChainId } from "src/config/constants/contracts";
import { CHAIN_ID } from "src/types/enums";
import { Address, encodeFunctionData, erc20Abi, getContract, Hex, maxUint256, parseUnits, zeroAddress } from "viem";
import useVaultMigrate from "src/hooks/useVaultMigrate";
import { convertQuoteToRoute, getContractCallsQuote, getStatus } from "@lifi/sdk";
import steerZapperAbi from "src/assets/abis/steerZapperAbi";
import { awaitTransaction, toWei } from "src/utils/common";
import { approveErc20, getBalance } from "src/api/token";
import { buildTransaction, getBridgeStatus, getRoute } from "src/api/bridge";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useConnectors } from "wagmi";
import Bridge from "../../utils/Bridge";
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
    const { platformTVL } = usePlatformTVL();
    const clickMeButtonRef = useRef<HTMLButtonElement>(null);

    const { migrate } = useVaultMigrate();

    const fn = async () => {
        setModelOpen(true);

        const bridge = new Bridge(
            currentWallet!,
            addressesByChainId[CHAIN_ID.CORE].nativeUsdAddress!,
            addressesByChainId[CHAIN_ID.ARBITRUM].nativeUsdAddress!,
            CHAIN_ID.ARBITRUM,
            CHAIN_ID.CORE,
            1000000n,
            "",
            getWalletClient
        );
        console.log("approve");
        await bridge.approve();
        console.log("init");
        const hash = await bridge.initialize();
        console.log("hash =>", hash);
        console.log("waiting for confirm");
        const message = await bridge.waitForLayerZeroTx();
        console.log("message =>", message);
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
