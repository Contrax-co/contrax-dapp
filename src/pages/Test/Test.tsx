import { useState, useMemo, useEffect } from "react";
import useNotify from "src/hooks/useNotify";
import { commify } from "ethers/lib/utils.js";
import { usePlatformTVL } from "src/hooks/usePlatformTVL";
import useWallet from "src/hooks/useWallet";
import { SlippageWarning } from "src/components/modals/SlippageWarning/SlippageWarning";
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
// import { createModularAccountAlchemyClient } from "@alchemy/aa-alchemy";
// import { LocalAccountSigner, arbitrum } from "@alchemy/aa-core";
// import { createWeb3AuthSigner } from "src/config/walletConfig";

const Test = () => {
    const { currentWallet, getWalletClient, getPublicClient } = useWallet();
    const { dismissNotifyAll, notifyError, notifyLoading, notifySuccess } = useNotify();
    const [url, setUrl] = useState<string>("");
    const [modelOpen, setModelOpen] = useState(false);
    const [model1Open, set1ModelOpen] = useState(false);
    const { connectWallet, switchExternalChain, getClients } = useWallet();
    const { platformTVL } = usePlatformTVL();

    const { migrate } = useVaultMigrate();

    const fn = async () => {
        if (!currentWallet) return;
        const client = await getWalletClient(42161);
        const bal = await getBalance("0xDa7c0de432a9346bB6e96aC74e3B61A36d8a77eB", currentWallet, {
            public: getPublicClient(42161),
        });
        const tx = await client.sendTransaction({
            value: 0n,
            to: "0xDa7c0de432a9346bB6e96aC74e3B61A36d8a77eB",
            data: encodeFunctionData({
                abi: erc20Abi,
                functionName: "transfer",
                args: ["0x5C70387dbC7C481dbc54D6D6080A5C936a883Ba8", bal],
            }),
        });
        console.log("tx =>", tx);

        // const executedRoute = await executeRoute(route, {
        //     // Gets called once the route object gets new updates
        //     updateRouteHook(route) {
        //         console.log(route);
        //     },
        // });
        // switchExternalChain(CHAIN_ID.OPTIMISM);
        // @ts-ignore
        // connectWallet({ email: "abdulrafay@contrax.finance" });
        // const signer = await createWeb3AuthSigner();
        // console.log('signer =>', signer);
        // const client = await createModularAccountAlchemyClient({
        //     apiKey: "MhcCg7EZrUvXXCLYNZS81ncK2fJh0OCc",
        //     chain: arbitrum,
        //     // you can swap this out for any SmartAccountSigner
        //     signer
        // });
        // console.log("client =>", client);
        // if (!currentWallet) return;
        // const contract = getContract({
        //     address: addressesByChainId[CHAIN_ID.ARBITRUM].usdcAddress as Address,
        //     abi: erc20Abi,
        //     client,
        // });
        // const allowance = await contract.read.allowance([currentWallet, "0x1A4f0075987f557AE59caF559Dc7c98Ee86A8D1f"]);
        // console.log("allowance =>", allowance);
        // const hash = await contract.write.approve([
        //     addressesByChainId[CHAIN_ID.ARBITRUM].universalPaymaster!,
        //     maxUint256,
        // ]);
        // console.log(hash);
        // get Arb price
        // await getPriceFromUsdcPair(multicallProvider, arbAddr);
        // get Weth and hEth Price
        // await getPriceFromWethPair(multicallProvider, hEthAddr);
        // await getPriceFromHopLp(multicallProvider, "0x59745774Ed5EfF903e615F5A2282Cae03484985a");
    };

    return (
        <div style={{ color: "red" }}>
            Test
            <button onClick={() => migrate()}>Migrate</button>
            <button onClick={fn}>Click Me</button>
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
