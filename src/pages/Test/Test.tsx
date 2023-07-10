import { useState } from "react";
import useNotify from "src/hooks/useNotify";
import { commify } from "ethers/lib/utils.js";
import { usePlatformTVL } from "src/hooks/usePlatformTVL";

const Test = () => {
    const { dismissNotifyAll, notifyError, notifyLoading, notifySuccess } = useNotify();
    const [url, setUrl] = useState<string>("");
    const { platformTVL } = usePlatformTVL();

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
