import json from "src/config/constants/pools.json";
import { utils } from "ethers";
import { getEarnings } from "src/api/farms";
import useWallet from "src/hooks/useWallet";
import { getPricesByTime } from "src/api/token";
import useTotalSupplies from "src/hooks/useTotalSupplies";
import usePriceOfTokens from "src/hooks/usePriceOfTokens";
import useFarms from "src/hooks/farms/useFarms";
import useNotify from "src/hooks/useNotify";

const Test = () => {
    const { dismissNotifyAll, notifyError, notifyLoading, notifySuccess } = useNotify();
    const fn = () => {};
    return (
        <div onClick={fn} style={{ color: "red" }}>
            Test
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
        </div>
    );
};

export default Test;
