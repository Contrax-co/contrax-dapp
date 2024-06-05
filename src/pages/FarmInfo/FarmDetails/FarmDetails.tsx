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
import { useApy } from "src/hooks/useApy";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { VaultsApy } from "src/api/stats";
import { useAppDispatch, useAppSelector } from "src/state";
import { fetchAllPoolFeesThunk } from "src/state/fees/feesReducer";
import { PoolFees } from "src/api/fees";

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
                        <FarmDetailsApy farm={farm} />
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

const FarmDetailsApy = ({ farm }: { farm: Farm }) => {
    const downsampleData = (data: VaultsApy[]) => {
        if (!data || data.length === 0) return;

        const monthlyData = [];
        const tempMap: { [key: string]: { date: string; apy: number; count: number } } = {};

        data.forEach((entry) => {
            const date = new Date(entry.timestamp * 1000);

            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();

            //   const [year, month] = entry.timestamp.split('-');
            const key = `${day}-${month}-${year}`;

            if (!tempMap[key]) {
                tempMap[key] = { date: `${day}-${month}-${year}`, apy: entry.apy, count: 0 };
            }

            tempMap[key].apy += entry.apy;
            tempMap[key].count++;
        });

        for (const key in tempMap) {
            const averageApy = tempMap[key].apy / tempMap[key].count;
            monthlyData.push({ date: key, apy: averageApy });
        }

        return monthlyData;
    };
    const { lightMode } = useApp();
    console.log(lightMode);
    const { apy, averageApy, loading } = useApy(farm.id);
    const newData = downsampleData(apy);
    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    return (
        <div className={"apyContainer"}>
            <h1 className={`apy--light ${lightMode && "apy--dark"}`} style={{ fontSize: "50px", fontWeight: "bold" }}>
                APY
            </h1>
            <div className={"specificApy"}>
                <p className={`apy--light ${lightMode && "apy--dark"}`}>
                    <b>Average APY :</b>
                </p>
                {loading ? (
                    <Skeleton h={20} w={20} />
                ) : (
                    <p className={`apy--light ${lightMode && "apy--dark"}`}>{averageApy.toFixed(2)}%</p>
                )}
            </div>
            <div style={{ marginTop: "10px", width: "100%", height: "250px" }}>
                <p className={`apy--light ${lightMode && "apy--dark"}`} style={{ marginBottom: "10px" }}>
                    <b>APY Graph :</b>
                </p>
                {loading ? (
                    <Skeleton h={200} w={"100%"} />
                ) : (
                    <>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                width={1200}
                                height={250}
                                data={newData}
                                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#63cce0" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#63cce0" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(value) => {
                                        const [day, month, year] = value.split("-");
                                        return `${day} ${monthNames[parseInt(month) - 1]} ${year}`;
                                    }}
                                    label={{ fill: lightMode ? "black" : "white" }}
                                />
                                <YAxis label={{ fill: lightMode ? "black" : "white" }} />
                                <Tooltip />
                                <Area
                                    type="monotone"
                                    dataKey="apy"
                                    stroke="#63cce0"
                                    fillOpacity={1}
                                    fill="url(#colorUv)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </>
                )}
            </div>
        </div>
    );
};
export default FarmDetails;
