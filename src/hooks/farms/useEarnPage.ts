import { useMemo, useState } from "react";
import useFarmDetails from "./useFarmDetails";
import useFarms from "./useFarms";
import { FarmSortOptions } from "src/types/enums";
import { useFarmApys } from "./useFarmApy";
import { FarmData, FarmDataExtended } from "src/types";

const useEarnPage = () => {
    const { farms } = useFarms();
    const { farmDetails, isLoading, isFetched } = useFarmDetails();
    const [selectedPlatform, setSelectedPlatform] = useState<null | string>(null);
    const [sortSelected, setSortSelected] = useState<FarmSortOptions>(FarmSortOptions.Default);
    const { apys } = useFarmApys();

    const sortFn = () => {
        let data: FarmDataExtended[] = farms.map((ele) => {
            const queryData = Object.values(farmDetails).find((item: FarmData) => item?.id === ele.id);
            return {
                ...ele,
                ...queryData,
                apy: apys[ele.id].apy,
            };
        });
        if (selectedPlatform) data = data.filter((item) => item.platform === selectedPlatform);
        data = data
            .filter((item) => item.token_type === "Token")
            .concat(data.filter((item) => item.token_type === "LP Token"));
        if (!isFetched) return data;

        switch (sortSelected) {
            case FarmSortOptions.APY_High_to_Low:
                data = data.sort((a, b) => b.apy - a.apy);
                break;
            case FarmSortOptions.APY_Low_to_High:
                data = data.sort((a, b) => a.apy - b.apy);
                break;
            case FarmSortOptions.Deposit_High_to_Low:
                data = data.sort(
                    (a, b) =>
                        Number(b.withdrawableAmounts![0].amountDollar) - Number(a.withdrawableAmounts![0].amountDollar)
                );
                break;
            case FarmSortOptions.Deposit_Low_to_High:
                data = data.sort((a, b) => {
                    const aWithdrawableAmount =
                        a.withdrawableAmounts && a.withdrawableAmounts[0]
                            ? Number(a.withdrawableAmounts[0].amountDollar)
                            : 0;
                    const bWithdrawableAmount =
                        b.withdrawableAmounts && b.withdrawableAmounts[0]
                            ? Number(b.withdrawableAmounts[0].amountDollar)
                            : 0;

                    // Step 2: Sort vaults with deposits first (non-zero amounts)
                    if (aWithdrawableAmount === 0 && bWithdrawableAmount !== 0) return 1; // a has no deposit, so it goes after b
                    if (aWithdrawableAmount !== 0 && bWithdrawableAmount === 0) return -1; // a has deposit, so it goes before b

                    // Step 3: Sort by withdrawable amount in ascending order if both have deposits
                    return aWithdrawableAmount - bWithdrawableAmount;
                });
                break;
            case FarmSortOptions.Farms_Cross_Chain:
                // @ts-ignore
                data = data.sort((a, b) => b.isCrossChain - a.isCrossChain);
                break;
            case FarmSortOptions.Farms_Onchain:
                // @ts-ignore
                data = data.sort((a, b) => a.isCrossChain - b.isCrossChain);
                break;
            default:
                data = data.sort((a, b) => {
                    // return Number(b.withdrawableAmounts![0].amountDollar) - Number(a.withdrawableAmounts![0].amountDollar);

                    const aWithdrawableAmount =
                        a.withdrawableAmounts && a.withdrawableAmounts[0]
                            ? Number(a.withdrawableAmounts[0].amountDollar)
                            : 0;
                    const bWithdrawableAmount =
                        b.withdrawableAmounts && b.withdrawableAmounts[0]
                            ? Number(b.withdrawableAmounts[0].amountDollar)
                            : 0;

                    if (aWithdrawableAmount !== bWithdrawableAmount) {
                        return bWithdrawableAmount - aWithdrawableAmount; // Sort by deposited amount descending
                    }

                    // Step 2: If withdrawable amounts are equal or both are zero, sort by type ("A" first, then "B")
                    if (a.token_type !== b.token_type) {
                        if (a.token_type === "Token") return -1; // Type "A" comes first
                        if (b.token_type === "Token") return 1; // Type "B" comes after
                    }

                    // Step 3: If both are the same type, sort by isCrossChain (false first, true after)
                    if (a.isCrossChain !== b.isCrossChain) {
                        // @ts-ignore
                        return a.isCrossChain - b.isCrossChain; // false (0) comes before true (1)
                    }
                    return 0;
                });
                break;
        }
        return data;
    };

    const sortedFarms = useMemo(() => {
        return sortFn();
    }, [sortSelected, selectedPlatform, farmDetails, farms, isFetched]);

    return {
        sortedFarms,
        farms,
        apys,
        farmDetails,
        selectedPlatform,
        setSelectedPlatform,
        sortSelected,
        setSortSelected,
    };
};

export default useEarnPage;
