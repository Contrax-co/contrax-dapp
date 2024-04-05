import { useState } from "react";
import useNotify from "src/hooks/useNotify";
import { commify } from "ethers/lib/utils.js";
import { usePlatformTVL } from "src/hooks/usePlatformTVL";
import useWallet from "src/hooks/useWallet";
import { SlippageWarning } from "src/components/modals/SlippageWarning/SlippageWarning";
import SuccessfulEarnTrax from "src/components/modals/SuccessfulEarnTrax/SuccessfulEarnTrax";
import { SlippageNotCalculate } from "src/components/modals/SlippageNotCalculate/SlippageNotCalculate";

const Test = () => {
    const { dismissNotifyAll, notifyError, notifyLoading, notifySuccess } = useNotify();
    const [url, setUrl] = useState<string>("");
    const [modelOpen, setModelOpen] = useState(false);
    const [model1Open, set1ModelOpen] = useState(false);
    const { platformTVL } = usePlatformTVL();
    const { multicallProvider } = useWallet();

    const fn = async () => {
        const usdtAddr = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9";
        const wethAddr = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";
        const hEthAddr = "0xDa7c0de432a9346bB6e96aC74e3B61A36d8a77eB";
        const arbAddr = "0x912CE59144191C1204E64559FE8253a0e49E6548";
        // get Arb price
        // await getPriceFromUsdcPair(multicallProvider, arbAddr);
        // get Weth and hEth Price
        // await getPriceFromWethPair(multicallProvider, hEthAddr);
        // await getPriceFromHopLp(multicallProvider, "0x59745774Ed5EfF903e615F5A2282Cae03484985a");
    };

    return (
        <div style={{ color: "red" }}>
            Test
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
            {modelOpen && (
                <SlippageNotCalculate
                    handleClose={() => setModelOpen(false)}
                    handleSubmit={() => set1ModelOpen(false)}
                />
            )}
        </div>
    );
};

export default Test;
