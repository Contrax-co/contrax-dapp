import { useState, useMemo, useEffect } from "react";
import useNotify from "src/hooks/useNotify";
import { commify } from "ethers/lib/utils.js";
import { usePlatformTVL } from "src/hooks/usePlatformTVL";
import useWallet from "src/hooks/useWallet";
import { SlippageWarning } from "src/components/modals/SlippageWarning/SlippageWarning";
import SuccessfulEarnTrax from "src/components/modals/SuccessfulEarnTrax/SuccessfulEarnTrax";
import { addressesByChainId } from "src/config/constants/contracts";
import { CHAIN_ID } from "src/types/enums";
import { Address, encodeFunctionData, erc20Abi, getContract, Hex, maxUint256 } from "viem";
import useVaultMigrate from "src/hooks/useVaultMigrate";
import { convertQuoteToRoute, getContractCallsQuote, getStatus } from "@lifi/sdk";
import steerZapperAbi from "src/assets/abis/steerZapperAbi";
import { awaitTransaction, toWei } from "src/utils/common";
import { approveErc20, getBalance } from "src/api/token";
// import { createModularAccountAlchemyClient } from "@alchemy/aa-alchemy";
// import { LocalAccountSigner, arbitrum } from "@alchemy/aa-core";
// import { createWeb3AuthSigner } from "src/config/walletConfig";

const Test = () => {
    const { currentWallet } = useWallet();
    const { dismissNotifyAll, notifyError, notifyLoading, notifySuccess } = useNotify();
    const [url, setUrl] = useState<string>("");
    const [modelOpen, setModelOpen] = useState(false);
    const [model1Open, set1ModelOpen] = useState(false);
    const { connectWallet, switchExternalChain, getClients } = useWallet();
    const { platformTVL } = usePlatformTVL();

    const { migrate } = useVaultMigrate();

    const fn = async () => {
        if (!currentWallet) return;
        const usdcAmount = toWei(2, 6);
        const calldata = encodeFunctionData({
            abi: steerZapperAbi,
            functionName: "zapIn",
            args: [
                "0x76512AB6a1DEDD45B75dee47841eB9feD2411789",
                0n,
                "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
                usdcAmount,
            ],
        });
        const quote = await getContractCallsQuote({
            fromAddress: currentWallet,
            fromChain: CHAIN_ID.ARBITRUM,
            toChain: CHAIN_ID.BASE,
            fromToken: addressesByChainId[CHAIN_ID.ARBITRUM].usdcAddress,
            toToken: addressesByChainId[CHAIN_ID.BASE].usdcAddress,
            toAmount: usdcAmount.toString(),
            contractOutputsToken: "0x76512AB6a1DEDD45B75dee47841eB9feD2411789",
            contractCalls: [
                {
                    fromAmount: usdcAmount.toString(),
                    fromTokenAddress: addressesByChainId[CHAIN_ID.BASE].usdcAddress,
                    toContractAddress: "0x287a5f47002e9b51A4aDa65A3Fc147f6AD25f2d0",
                    toTokenAddress: "0x76512AB6a1DEDD45B75dee47841eB9feD2411789",
                    toContractCallData: calldata,
                    toContractGasLimit: "2000000",
                },
            ],
        });
        console.log("quote =>", quote);
        const route = convertQuoteToRoute(quote);
        console.log("route =>", route);
        for await (const step of route.steps) {
            const client = await getClients(step.transactionRequest!.chainId!);
            const { data, from, gasLimit, gasPrice, to, value } = step.transactionRequest!;
            const tokenBalance = await getBalance(
                addressesByChainId[step.transactionRequest!.chainId!].usdcAddress,
                currentWallet,
                client
            );
            if (tokenBalance < BigInt(step.estimate.fromAmount)) {
                throw new Error("Insufficient Balance");
            }
            await approveErc20(
                addressesByChainId[step.transactionRequest!.chainId!].usdcAddress,
                step.estimate.approvalAddress as Address,
                BigInt(step.estimate.fromAmount),
                currentWallet,
                client
            );
            const transaction = client.wallet.sendTransaction({
                data: data as Hex,
                gasLimit: gasLimit!,
                gasPrice: BigInt(gasPrice!),
                to: to as Address,
                value: BigInt(value!),
            });
            const res = await awaitTransaction(transaction, client);
            console.log("res =>", res);
            if (!res.status) {
                throw new Error(res.error);
            }
            let status: string;
            do {
                const result = await getStatus({
                    txHash: res.txHash!,
                    fromChain: step.action.fromChainId,
                    toChain: step.action.toChainId,
                    bridge: step.tool,
                });
                status = result.status;

                console.log(`Transaction status for ${res.txHash}:`, status);

                // Wait for a short period before checking the status again
                await new Promise((resolve) => setTimeout(resolve, 5000));
            } while (status !== "DONE" && status !== "FAILED");

            if (status === "FAILED") {
                console.error(`Transaction ${res.txHash} failed`);
                return;
            }
        }
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
