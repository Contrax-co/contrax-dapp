import { useState } from "react";
import { RiArrowDownSLine } from "react-icons/ri";
import PoolButton from "src/components/PoolButton/PoolButton";
import { Tabs } from "src/components/Tabs/Tabs";
import useApp from "src/hooks/useApp";
import { Farm } from "src/types";
import { FarmTransactionType } from "src/types/enums";
import { Description } from "../Description/Description";
import DetailInput from "../DetailInput/DetailInput";
import Details from "../Details/Details";
import "./DropDownView.css";
import { useAppDispatch, useAppSelector } from "src/state";
import { setFarmDetailInputOptions } from "src/state/farms/farmsReducer";
import { FarmDetailInputOptions } from "src/state/farms/types";

export const DropDownView: React.FC<{ farm: Farm }> = ({ farm }) => {
    const { lightMode } = useApp();
    const [showMoreDetail, setShowMoreDetail] = useState(false);
    const transactionType = useAppSelector((state) => state.farms.farmDetailInputOptions.transactionType);
    const dispatch = useAppDispatch();

    const setFarmOptions = (opt: Partial<FarmDetailInputOptions>) => {
        dispatch(setFarmDetailInputOptions(opt));
    };

    return (
        <div className={`dropdown_menu ${lightMode && "dropdown_menu--light"}`}>
            <div className="basic_container">
                <div className="type_tab">
                    <Tabs>
                        <PoolButton
                            onClick={() => setFarmOptions({ transactionType: FarmTransactionType.Deposit })}
                            description={FarmTransactionType.Deposit}
                            active={transactionType === FarmTransactionType.Deposit}
                        />
                        <PoolButton
                            onClick={() => setFarmOptions({ transactionType: FarmTransactionType.Withdraw })}
                            description={FarmTransactionType.Withdraw}
                            active={transactionType === FarmTransactionType.Withdraw}
                        />
                    </Tabs>
                </div>
                <div className="type_selector">
                    <p
                        onClick={() => setFarmOptions({ transactionType: FarmTransactionType.Deposit })}
                        className={transactionType === FarmTransactionType.Deposit ? "active" : ""}
                    >
                        {FarmTransactionType.Deposit}
                    </p>
                    <p
                        onClick={() => setFarmOptions({ transactionType: FarmTransactionType.Withdraw })}
                        className={transactionType === FarmTransactionType.Withdraw ? "active" : ""}
                    >
                        {FarmTransactionType.Withdraw}
                    </p>
                </div>
                <div className="right_container">
                    <Description farm={farm} />
                    <DetailInput farm={farm} />
                </div>
            </div>

            {!showMoreDetail ? (
                <div
                    className={`see_details_dropdown ${lightMode && "see_details_dropdown--light"}`}
                    onClick={() => setShowMoreDetail(true)}
                >
                    <p className={`see_details_description ${lightMode && "see_details_description--light"}`}>
                        See more details
                    </p>
                    <RiArrowDownSLine />
                </div>
            ) : (
                <Details farm={farm} onClick={() => setShowMoreDetail(false)} />
            )}
        </div>
    );
};
