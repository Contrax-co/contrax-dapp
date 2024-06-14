import useFarms from "src/hooks/farms/useFarms";
import useApp from "src/hooks/useApp";
import { useSlippageDeposit, useSlippageWithdraw } from "src/hooks/useSlippage";
import { Farm } from "src/types";
import { zeroAddress } from "viem";
import "./FarmDetails.css";
import { useEffect, useMemo, useState } from "react";
import { Skeleton } from "src/components/Skeleton/Skeleton";
import { addressesByChainId } from "src/config/constants/contracts";
import { CHAIN_ID } from "src/types/enums";
import usePriceOfTokens from "src/hooks/usePriceOfTokens";
import { getLpAddressForFarmsPrice } from "src/utils/common";
import useTotalSupplies from "src/hooks/useTotalSupplies";
import { RiArrowDownSLine, RiArrowUpSLine } from "react-icons/ri";
import { useAppDispatch, useAppSelector } from "src/state";
import { fetchAllPoolFeesThunk } from "src/state/fees/feesReducer";
import { PoolFees } from "src/api/fees";
import FarmApyGraph from "../FarmApyGraph/FarmApyGraph";
import FarmLpGraph from "../FarmLpGraph/FarmLpGraph";

const FarmDetails = () => {
    const { lightMode } = useApp();
    const dispatch = useAppDispatch();
    const { poolFees, isLoadingPoolFees } = useAppSelector((state) => state.fees);
    const { farms } = useFarms();

    useEffect(() => {
        if (poolFees.length === 0) {
            dispatch(fetchAllPoolFeesThunk());
        }
    }, [poolFees]);
    return (
        <>
            <div className={`farmslip_table_header ${lightMode && "farmslip_table_header_light"}`}>
                <p className="item_asset" style={{ marginLeft: 20 }}>
                    Vaults
                </p>
                <p className={`header_deposit`}>
                    <span>TVL in pool</span>
                </p>
                <p className={`header_deposit`}>
                    <span>TVL in underlying pool</span>
                </p>
            </div>
            {farms.map((farm) => (
                <FarmDetailsRow key={farm.id} farm={farm} poolFees={poolFees} isLoadingPoolFees={isLoadingPoolFees} />
            ))}
        </>
    );
};

const FarmDetailsRow: React.FC<{ farm: Farm; poolFees: PoolFees[]; isLoadingPoolFees: boolean }> = ({
    farm,
    poolFees,
    isLoadingPoolFees,
}) => {
    const { lightMode } = useApp();
    const [dropDown, setDropDown] = useState(false);
    const lpAddress = getLpAddressForFarmsPrice([farm])[0];
    const { formattedSupplies } = useTotalSupplies();
    const {
        prices: { [farm.token1]: price1, [farm.token2!]: price2, [lpAddress]: lpPrice },
    } = usePriceOfTokens();

    const feesCollected = useMemo(() => {
        return (
            poolFees.find((item) => item.pool_address.toLowerCase() === farm.vault_addr.toLowerCase())?.fees_usd || 0
        );
    }, [poolFees, farm.vault_addr]);

    return (
        <>
            <div
                className={`farmslip_table_pool ${lightMode && "farmslip_table_pool_light"}`}
                style={{ padding: "30px" }}
                onClick={() => setDropDown(!dropDown)}
            >
                <div className={"slippageContainer"}>
                    <div className="title_container titleContainerSlippage" style={{ width: "100%" }}>
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
                    <div className={`tvls tvl_underlying ${lightMode && "tvl_underlying--light"}`}>
                        {formattedSupplies[farm.vault_addr] &&
                            (formattedSupplies[farm.vault_addr]! * lpPrice).toLocaleString("en-US", {
                                style: "currency",
                                currency: "USD",
                                maximumFractionDigits: 0,
                            })}
                    </div>
                    <div className={`tvls tvl_underlying ${lightMode && "tvl_underlying--light"}`}>
                        {formattedSupplies[farm.lp_address] &&
                            (formattedSupplies[farm.lp_address]! * lpPrice).toLocaleString("en-US", {
                                style: "currency",
                                currency: "USD",
                                maximumFractionDigits: 0,
                            })}
                    </div>
                    <div className={`dropdown ${lightMode && "dropdown--light"}`}>
                        {!dropDown ? <RiArrowDownSLine /> : <RiArrowUpSLine />}
                    </div>
                </div>
                {dropDown && (
                    <div>
                        <div className={"tvlMobileContainer"}>
                            <div>
                                <div
                                    style={{ width: "100%" }}
                                    className={`tvl_mobile ${lightMode && "tvl_mobile--light"}`}
                                >
                                    TVL in pool
                                </div>
                                <div
                                    className={`tvl_underlying ${lightMode && "tvl_underlying--light"}`}
                                    style={{ width: "100%" }}
                                >
                                    {formattedSupplies[farm.vault_addr] &&
                                        (formattedSupplies[farm.vault_addr]! * lpPrice).toLocaleString("en-US", {
                                            style: "currency",
                                            currency: "USD",
                                            maximumFractionDigits: 0,
                                        })}
                                </div>
                            </div>
                            <div>
                                <div
                                    style={{ width: "100%" }}
                                    className={`tvl_mobile ${lightMode && "tvl_mobile--light"}`}
                                >
                                    TVL in underlying pool
                                </div>
                                <div
                                    className={`tvl_underlying ${lightMode && "tvl_underlying--light"}`}
                                    style={{ width: "100%" }}
                                >
                                    {formattedSupplies[farm.lp_address] &&
                                        (formattedSupplies[farm.lp_address]! * lpPrice).toLocaleString("en-US", {
                                            style: "currency",
                                            currency: "USD",
                                            maximumFractionDigits: 0,
                                        })}
                                </div>
                            </div>
                        </div>
                        <SlippageIndividual farm={farm} />
                        <FarmApyGraph farm={farm} />
                        <FarmLpGraph farm={farm} />
                        <div style={{ marginTop: "3rem" }}>
                            <div className={"specificApy"}>
                                <p className={`apy--light ${lightMode && "apy--dark"}`}>
                                    <b>Fees Collected:</b>
                                </p>
                                {isLoadingPoolFees ? (
                                    <Skeleton h={20} w={20} />
                                ) : (
                                    <p className={`apy--light ${lightMode && "apy--dark"}`}>
                                        {feesCollected.toLocaleString("en-US", {
                                            style: "currency",
                                            currency: "USD",
                                            minimumFractionDigits: 2,
                                        })}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

const SlippageIndividual: React.FC<{ farm: Farm }> = ({ farm }) => {
    const { lightMode } = useApp();
    const maxAmounts = [100, 1000, 10000];
    const tokens = [zeroAddress, addressesByChainId[CHAIN_ID.ARBITRUM].usdcAddress];
    const { slippageAmounts, loadingDeposit } = useSlippageDeposit(maxAmounts, tokens, farm);
    const { slippageAmounts: slippageAmountWithdraw, loadingWithdraw } = useSlippageWithdraw(maxAmounts, tokens, farm);
    return (
        <div className={"slippageIndividual"}>
            <div style={{ width: "100%" }}>
                <h1 className={`slippageTitle ${lightMode && "slippageTitle--light"}`}>Deposit</h1>
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
                                <div
                                    key={`${maxAmount}-${token}`}
                                    className={`slippagecolor ${lightMode && "slippagecolor--light"}`}
                                >
                                    Slippage for {maxAmount} of {token === zeroAddress ? "ETH Address" : "USDC Address"}
                                    : <b>{slippageAmounts[`${maxAmount}-${token}`]?.toFixed(2) || "-"}</b>
                                </div>
                            ))
                        )}
                    </>
                )}
            </div>
            <div style={{ width: "100%" }}>
                <h1 className={`slippageTitle ${lightMode && "slippageTitle--light"}`}>Withdraw</h1>
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
                                <div
                                    key={`${maxAmount}-${token}`}
                                    className={`slippagecolor ${lightMode && "slippagecolor--light"}`}
                                >
                                    Slippage for {maxAmount} of {token === zeroAddress ? "ETH Address" : "USDC Address"}
                                    : <b>{slippageAmountWithdraw[`${maxAmount}-${token}`]?.toFixed(2) || "-"}</b>
                                </div>
                            ))
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default FarmDetails;
