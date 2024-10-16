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
    erc20Abi,
    getContract,
    Hex,
    hexToString,
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
        setModelOpen(true);

        const bridge = new Bridge(
            currentWallet!,
            CHAIN_ID.CORE,
            addressesByChainId[CHAIN_ID.CORE].usdcAddress,
            CHAIN_ID.BASE,
            addressesByChainId[CHAIN_ID.BASE].usdcAddress,
            parseUnits("1", 6),
            "",
            getWalletClient,
            prices[CHAIN_ID.CORE][zeroAddress]
        );
        await bridge.approve();
        const hash = await bridge.initialize();
        console.log("hash =>", hash);
        // console.log("bridge.nativeFee =>", bridge.nativeFee);
        const message = await bridge.waitForLayerZeroTx();
        // const message = await bridge.waitForLayerZeroTx(
        //     42161,
        //     "0x55ae8ce6589cdcaeb473261cfd274b16b8b767193b6ffdc12dd9026ecce6f4e9"
        // );
        console.log("message =>", message);
        // const dst = await bridge.waitAndGetDstAmt();
        // console.log("dst =>", dst);
        // console.timeEnd("bridge");
        // let res = await bridge.getDestinationBridgedAmt(
        //     CHAIN_ID.ARBITRUM,
        //     CHAIN_ID.BASE,
        //     "0x55ae8ce6589cdcaeb473261cfd274b16b8b767193b6ffdc12dd9026ecce6f4e9"
        // );
        // console.log("Arbitrum to base =>", res);
        // res = await bridge.getDestinationBridgedAmt(
        //     CHAIN_ID.CORE,
        //     CHAIN_ID.ARBITRUM,
        //     "0x10088629459e891ab355cd7b0f613f69d715e19964be9ec470a22799166310cb"
        // );
        // console.log("core to arbitrum =>", res);
        // res = await bridge.getDestinationBridgedAmt(
        //     CHAIN_ID.ARBITRUM,
        //     CHAIN_ID.CORE,
        //     "0x8082d0a012281db0ffb3ae4ef3fcdef4968d9965b984b2d61b791950a3c36dd7"
        // );
        // console.log("arbitrum to core =>", res);
        // await bridge.estimateAmountOut();
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
