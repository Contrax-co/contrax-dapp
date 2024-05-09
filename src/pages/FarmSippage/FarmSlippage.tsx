import React from "react";
import "./FarmSlippage.css";
import useApp from "src/hooks/useApp";

const FarmSlippage: React.FC = () => {
    const { lightMode } = useApp();
    return (
        <div className={`farmslip ${lightMode && "farmslip--light"}`}>
            <div className={`farmslip_header ${lightMode && "farmslip_header--light"}`}>
                <p>Slippage :</p>
            </div>
            <div className={`farmslip_table_header ${lightMode && "farmslip_table_header_light"}`}>
                <p className="item_asset" style={{ marginLeft: 20 }}>
                    Vaults
                </p>
                <p>
                    <span>Deposit</span>
                </p>
                <p className={`header_deposite`}>
                    <span>Withdraw</span>
                </p>
                <p></p>
            </div>
            <div className={`farmslip_table_pool ${lightMode && "farmslip_table_pool_light"}`}>
                <div className="farmslip_table_row">
                    <div className="title_container">
                        <div className="pair">
                            <img
                                alt={"farm?.alt1"}
                                className={`logofirst ${lightMode && "logofirst--light"}`}
                                src={
                                    "https://raw.githubusercontent.com/Contrax-co/tokens/main/arbitrum-tokens/0x02f92800F57BCD74066F5709F1Daa1A4302Df875/logo.png"
                                }
                            />
                        </div>
                        <div>
                            <div className="pool_title">
                                <p className={`pool_name ${lightMode && "pool_name--light"}`}>PEAS</p>
                                <div className="rewards_div">
                                    <p className={`farm_type ${lightMode && "farm_type--light"}`}>Hop</p>
                                    <img alt={""} className="rewards_image" src={"./hop.svg"} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="depositContainer">
                        <div className="deposit">
                            <img
                                src={
                                    "https://raw.githubusercontent.com/Contrax-co/tokens/main/arbitrum-tokens/0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8/logo.png"
                                }
                                alt=""
                                className={"logoUSDC"}
                            />
                            <p>2000</p>
                        </div>
                        <div className="deposit">
                            <img
                                src={
                                    "https://raw.githubusercontent.com/Contrax-co/tokens/main/arbitrum-tokens/0x82aF49447D8a07e3bd95BD0d56f35241523fBab1/logo.png"
                                }
                                alt=""
                                className={"logoUSDC"}
                            />
                            <p>3000</p>
                        </div>
                    </div>
                    <div className="depositContainer">
                        <div className="deposit">
                            <img
                                src={
                                    "https://raw.githubusercontent.com/Contrax-co/tokens/main/arbitrum-tokens/0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8/logo.png"
                                }
                                alt=""
                                className={"logoUSDC"}
                            />
                            <p>3000</p>
                        </div>
                        <div className="deposit">
                            <img
                                src={
                                    "https://raw.githubusercontent.com/Contrax-co/tokens/main/arbitrum-tokens/0x82aF49447D8a07e3bd95BD0d56f35241523fBab1/logo.png"
                                }
                                alt=""
                                className={"logoUSDC"}
                            />
                            <p>2000</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FarmSlippage;
