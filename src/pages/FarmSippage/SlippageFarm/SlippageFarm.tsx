import useFarms from "src/hooks/farms/useFarms";
import useApp from "src/hooks/useApp";
import { useSlippageDeposit, useSlippageWithdraw } from "src/hooks/useSlippage";
import { Farm } from "src/types";
import { zeroAddress } from "viem";
import downArrow from "../../../assets/images/down-arrow.png";
import "./SlippageFarm.css";
import { useState } from "react";
import { Skeleton } from "src/components/Skeleton/Skeleton";
import { addressesByChainId } from "src/config/constants/contracts";
import { CHAIN_ID } from "src/types/enums";

const SlippageFarm = () => {
    const { farms } = useFarms();
    return (
        <>
            {farms.map((farm) => (
                <SlippageFarmRow key={farm.id} farm={farm} />
            ))}
        </>
    );
};

const SlippageFarmRow: React.FC<{ farm: Farm }> = ({ farm }) => {
    const { lightMode } = useApp();
    const [dropDown, setDropDown] = useState(false);
    return (
        <>
            <div
                className={`farmslip_table_pool ${lightMode && "farmslip_table_pool_light"}`}
                style={{ padding: "30px" }}
            >
                <div className={"slippageContainer"}>
                    <div className="title_container">
                        <div className="pair">
                            <img alt={farm?.alt1} src={farm?.logo1} height={50} width={50} />
                            {farm.logo2 ? <img alt={farm?.alt1} src={farm?.logo2} height={50} width={50} /> : undefined}
                        </div>
                        <div>
                            <div className="pool_title">
                                <p className={`pool_name ${lightMode && "pool_name--light"}`}>{farm.name}</p>
                                <div className="rewards_div">
                                    <p className={`farm_type ${lightMode && "farm_type--light"}`}>{farm.platform}</p>
                                    <img alt={""} className="rewards_image" src={farm.platform_logo} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <img
                        src={downArrow}
                        alt=""
                        width={30}
                        onClick={() => setDropDown(!dropDown)}
                        style={{ transform: dropDown ? "rotate(180deg)" : "rotate(0deg)" }}
                    />
                </div>
                {dropDown && <SlippageIndividual farm={farm} />}
            </div>
        </>
    );
};

const SlippageIndividual: React.FC<{ farm: Farm }> = ({ farm }) => {
    const maxAmounts = [100, 1000, 10000];
    const tokens = [zeroAddress, addressesByChainId[CHAIN_ID.ARBITRUM].usdcAddress];
    const { slippageAmounts, loadingDeposit } = useSlippageDeposit(maxAmounts, tokens, farm);
    const { slippageAmounts: slippageAmountWithdraw, loadingWithdraw } = useSlippageWithdraw(maxAmounts, tokens, farm);
    return (
        <div className={"slippageIndividual"}>
            <div style={{ width: "100%" }}>
                <h1 style={{ fontSize: "14px", marginTop: "10px" }}>Deposit</h1>
                {loadingDeposit ? (
                    <>
                        <Skeleton h={20} w={"100%"} style={{ marginBottom: "10px", marginTop: "10px" }} />
                        <Skeleton h={20} w={"100%"} style={{ marginBottom: "10px" }} />
                        <Skeleton h={20} w={"100%"} style={{ marginBottom: "10px" }} />
                        <Skeleton h={20} w={"100%"} />
                    </>
                ) : (
                    <>
                        {maxAmounts.map((maxAmount) =>
                            tokens.map((token) => (
                                <div key={`${maxAmount}-${token}`}>
                                    Slippage for {maxAmount} of{" "}
                                    <img
                                        src={
                                            token === zeroAddress
                                                ? "https://raw.githubusercontent.com/Contrax-co/tokens/main/arbitrum-tokens/0x82aF49447D8a07e3bd95BD0d56f35241523fBab1/logo.png"
                                                : "https://raw.githubusercontent.com/Contrax-co/tokens/main/arbitrum-tokens/0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8/logo.png"
                                        }
                                        height={24}
                                        width={24}
                                        alt=""
                                    />
                                    :{" "}
                                    {slippageAmounts[`${maxAmount}-${token}`]?.toFixed(2) || "Slippage not calaculated"}
                                </div>
                            ))
                        )}
                    </>
                )}
            </div>
            <div style={{ width: "100%" }}>
                <h1 style={{ fontSize: "14px", marginTop: "10px" }}>Withdraw</h1>
                {loadingWithdraw ? (
                    <>
                        <Skeleton h={20} w={"100%"} style={{ marginBottom: "10px", marginTop: "10px" }} />
                        <Skeleton h={20} w={"100%"} style={{ marginBottom: "10px" }} />
                        <Skeleton h={20} w={"100%"} style={{ marginBottom: "10px" }} />
                        <Skeleton h={20} w={"100%"} />
                    </>
                ) : (
                    <>
                        {maxAmounts.map((maxAmount) =>
                            tokens.map((token) => (
                                <div key={`${maxAmount}-${token}`}>
                                    Slippage for {maxAmount} of{" "}
                                    <img
                                        src={
                                            token === zeroAddress
                                                ? "https://raw.githubusercontent.com/Contrax-co/tokens/main/arbitrum-tokens/0x82aF49447D8a07e3bd95BD0d56f35241523fBab1/logo.png"
                                                : "https://raw.githubusercontent.com/Contrax-co/tokens/main/arbitrum-tokens/0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8/logo.png"
                                        }
                                        height={24}
                                        width={24}
                                        alt=""
                                    />
                                    :{" "}
                                    {slippageAmountWithdraw[`${maxAmount}-${token}`]?.toFixed(2) ||
                                        "Slippage not calaculated"}
                                </div>
                            ))
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
export default SlippageFarm;
