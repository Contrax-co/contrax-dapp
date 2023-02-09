import { useMemo } from "react";
import { RiArrowUpSLine } from "react-icons/ri";
import useApp from "src/hooks/useApp";
import useBalances from "src/hooks/useBalances";
import usePriceOfTokens from "src/hooks/usePriceOfTokens";
import { FarmDetails } from "src/types";
import "./Details.css";
import Toggle from "src/components/FarmItem/Toggle";

interface Props {
    farm: FarmDetails;
    onClick: () => void;
    shouldUseLp: boolean;
    setShouldUseLp: (shouldUseLp: boolean | ((prev: boolean) => boolean)) => void;
}

const Details: React.FC<Props> = ({ farm, shouldUseLp, setShouldUseLp, ...props }) => {
    const { lightMode } = useApp();
    const {
        prices: { [farm.token1]: price1, [farm.token2!]: price2, [farm.lp_address]: lpPrice },
    } = usePriceOfTokens([farm.token1, farm.token2 || "", farm.lp_address]);
    const { formattedBalances } = useBalances([
        { address: farm.lp_address, decimals: farm.decimals },
        { address: farm.vault_addr, decimals: farm.decimals },
    ]);
    const unstakedTokenValue = useMemo(() => formattedBalances[farm.lp_address], [formattedBalances]);
    const stakedTokenValue = useMemo(() => formattedBalances[farm.vault_addr], [formattedBalances]);

    return (
        <div className="details">
            <div className={`details_section detials_rate`}>
                {farm.token_type === "LP Token" ? (
                    <Toggle active={shouldUseLp} farm={farm} onClick={() => setShouldUseLp((prev) => !prev)} />
                ) : null}
                <div className={`details_dropdrown_header`}>
                    {farm.alt1 ? <img className={`details_logo1`} alt={farm.alt1} src={farm.logo1} /> : null}

                    {farm.alt2 ? <img className={`details_logo2`} alt={farm.alt2} src={farm.logo2} /> : null}

                    {farm.pair2 ? (
                        <p className={`details_pair_name ${lightMode && "details_pair_name--light"}`}>
                            {farm.pair1}/{farm.pair2}
                        </p>
                    ) : (
                        <p className={`details_pair_name ${lightMode && "details_pair_name--light"}`}>{farm.pair1}</p>
                    )}
                </div>

                <div className={`token_details`}>
                    {farm.alt1 ? (
                        <div
                            className={`details_single_token ${lightMode && "details_single_token--light"}`}
                            style={{ marginRight: "10px" }}
                        >
                            <img className={`mini_details_image`} alt={farm.alt1} src={farm.logo1} />
                            <p>
                                {farm.pair1} ={" "}
                                {price1.toLocaleString("en-US", {
                                    style: "currency",
                                    currency: "USD",
                                })}
                            </p>
                        </div>
                    ) : null}

                    {farm.alt2 ? (
                        <div className={`details_single_token ${lightMode && "details_single_token--light"}`}>
                            <img className={`mini_details_image`} alt={farm.alt2} src={farm.logo2} />
                            <p>
                                {farm.pair2} ={" "}
                                {price2.toLocaleString("en-US", {
                                    style: "currency",
                                    currency: "USD",
                                })}
                            </p>
                        </div>
                    ) : null}
                </div>
            </div>
            <div className={`details_top_container`}>
                <div className={`details_section detailed_position ${lightMode && "detailed_position--light"}`}>
                    <p className={`detailed_position_total ${lightMode && "detailed_position_total--light"}`}>
                        My Position
                    </p>

                    <div className={`detailed_header`}>
                        <p>Unstaked Position</p>
                        <div className={`unstaked_details`}>
                            <div className={`unstaked_details_header`}>
                                {farm.alt1 ? (
                                    <img className={`unstaked_images1`} alt={farm.alt1} src={farm.logo1} />
                                ) : null}

                                {farm.alt2 ? (
                                    <img className={`unstaked_images2`} alt={farm.alt2} src={farm.logo2} />
                                ) : null}

                                <p className={`detailed_unstaked_pairs`}>
                                    {unstakedTokenValue.toFixed(3)} {farm.name}
                                </p>
                            </div>

                            <p className={`detailed_unstaked_pairs`}>
                                {(lpPrice * unstakedTokenValue).toLocaleString("en-US", {
                                    style: "currency",
                                    currency: "USD",
                                })}
                            </p>
                        </div>
                    </div>

                    <div className={`detailed_header`}>
                        <p>Staked Position</p>
                        <div className={`unstaked_details`}>
                            <div className={`unstaked_details_header`}>
                                {farm.alt1 ? (
                                    <img className={`unstaked_images1`} alt={farm.alt1} src={farm.logo1} />
                                ) : null}

                                {farm.alt2 ? (
                                    <img className={`unstaked_images2`} alt={farm.alt2} src={farm.logo2} />
                                ) : null}

                                <p className={`detailed_unstaked_pairs`}>
                                    {stakedTokenValue.toFixed(3)} {farm.name}
                                </p>
                            </div>
                            <p className={`detailed_unstaked_pairs`}>
                                {(lpPrice * stakedTokenValue).toLocaleString("en-US", {
                                    style: "currency",
                                    currency: "USD",
                                })}
                            </p>
                        </div>
                    </div>
                </div>

                <div className={`details_section detailed_position ${lightMode && "detailed_position--light"}`}>
                    <p className={`detailed_position_total ${lightMode && "detailed_position_total--light"}`}>
                        Total Value Locked
                    </p>

                    {farm.totalPlatformBalance * farm.priceOfSingleToken ? (
                        <div className={`detailed_header`}>
                            <p>Pool Liquidity</p>
                            <div className={`unstaked_details`}>
                                <div className={`unstaked_details_header`}>
                                    {farm.alt1 ? (
                                        <img className={`unstaked_images1`} alt={farm.alt1} src={farm.logo1} />
                                    ) : null}

                                    {farm.alt2 ? (
                                        <img className={`unstaked_images2`} alt={farm.alt2} src={farm.logo2} />
                                    ) : null}

                                    <p className={`detailed_unstaked_pairs`}>
                                        {farm.totalPlatformBalance.toFixed(3)} {farm.name}
                                    </p>
                                </div>

                                <p className={`detailed_unstaked_pairs`}>
                                    {(farm.totalPlatformBalance * farm.priceOfSingleToken).toLocaleString("en-US", {
                                        style: "currency",
                                        currency: "USD",
                                        maximumFractionDigits: 0,
                                    })}
                                </p>
                            </div>
                        </div>
                    ) : null}

                    {farm.totalVaultBalance * farm.priceOfSingleToken ? (
                        <div className={`detailed_header`}>
                            <p>Vault Liquidity</p>
                            <div className={`unstaked_details`}>
                                <div className={`unstaked_details_header`}>
                                    {farm.alt1 ? (
                                        <img className={`unstaked_images1`} alt={farm.alt1} src={farm.logo1} />
                                    ) : null}

                                    {farm.alt2 ? (
                                        <img className={`unstaked_images2`} alt={farm.alt2} src={farm.logo2} />
                                    ) : null}

                                    <p className={`detailed_unstaked_pairs`}>
                                        {farm.totalVaultBalance.toFixed(3)} {farm.name}
                                    </p>
                                </div>
                                <p className={`detailed_unstaked_pairs`}>
                                    {(farm.totalVaultBalance * farm.priceOfSingleToken).toLocaleString("en-US", {
                                        style: "currency",
                                        currency: "USD",
                                        maximumFractionDigits: 0,
                                    })}
                                </p>
                            </div>
                        </div>
                    ) : null}

                    {farm.userVaultBalance / farm.totalVaultBalance ? (
                        <div className={`detailed_header`}>
                            <p>Share</p>
                            <div className={`unstaked_details`}>
                                <p className={`detailed_unstaked_pairs`}>
                                    {((farm.userVaultBalance / farm.totalVaultBalance) * 100 || 0).toFixed(2)}%
                                </p>
                                {/* <div className={`unstaked_details_header`}>
                                    {farm.alt1 ? (
                                        <img className={`unstaked_images1`} alt={farm.alt1} src={farm.logo1} />
                                    ) : null}

                                    {farm.alt2 ? (
                                        <img className={`unstaked_images2`} alt={farm.alt2} src={farm.logo2} />
                                    ) : null}
                                </div>
                                <p className={`detailed_unstaked_pairs`}>
                                    {(farm.totalVaultBalance * farm.priceOfSingleToken).toLocaleString("en-US", {
                                        style: "currency",
                                        currency: "USD",
                                        maximumFractionDigits: 0,
                                    })}
                                </p> */}
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>

            <div className={`details_retract ${lightMode && "details_retract--light"}`} onClick={props.onClick}>
                <p className={`details_retract_description ${lightMode && "details_retract_description--light"}`}>
                    See Less
                </p>
                <RiArrowUpSLine />
            </div>
        </div>
    );
};

export default Details;

