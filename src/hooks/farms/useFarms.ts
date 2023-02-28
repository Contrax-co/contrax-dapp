import { useMemo } from "react";
import pools from "src/config/constants/pools.json";
import { Farm, FarmDetails } from "src/types";
import { FarmType } from "src/types/enums";
import { getLpAddressForFarmsPrice } from "src/utils/common";
import usePriceOfTokens from "../usePriceOfTokens";
import useTotalSupplies from "../useTotalSupplies";
import { useFarmApys } from "./useFarmApy";
import useFarmsBalances from "./useFarmsBalances";

const farms = pools as Farm[];
const useFarms = (): { farms: Farm[] } => {
    return { farms: useMemo(() => farms, []) };
};

export default useFarms;

// export const useFarmDetails = (): {
//     farmDetails: FarmDetails[];
//     normalFarms: FarmDetails[];
//     advancedFarms: FarmDetails[];
//     isLoading: boolean;
// } => {
//     const vaultAddresses = useMemo(
//         () => farms.map((farm) => ({ address: farm.vault_addr, decimals: farm.decimals })),
//         []
//     );
//     const lpAddresses = useMemo(() => farms.map((farm) => ({ address: farm.lp_address, decimals: farm.decimals })), []);
//     const { formattedBalances: usersVaultBalances } = useFarmsBalances();
//     const { formattedSupplies: totalVaultSupplies, isLoading: isLoadingTotalVaultSupplies } =
//         useTotalSupplies(vaultAddresses);
//     const { formattedSupplies: totalPlatformSupplies, isLoading: isLoadingTotalPlatformSupplies } =
//         useTotalSupplies(lpAddresses);
//     const { prices: priceOfSingleToken, isLoading: isLoadingPricesOfSingleToken } = usePriceOfTokens(
//         getLpAddressForFarmsPrice(farms)
//     );
//     const { apys, isLoading: isLoadingApys } = useFarmApys();

//     const farmDetails = useMemo(() => {
//         return farms.map((farm) => {
//             const lpAddress = getLpAddressForFarmsPrice([farm])[0];
//             return {
//                 ...farm,
//                 userVaultBalance: usersVaultBalances[farm.vault_addr],
//                 totalVaultBalance: totalVaultSupplies[farm.vault_addr],
//                 totalPlatformBalance: totalPlatformSupplies[farm.lp_address],
//                 priceOfSingleToken: priceOfSingleToken[lpAddress] || (farm.stableCoin ? 1 : 0),
//                 apys: apys[farm.lp_address],
//             };
//         });
//     }, [apys, usersVaultBalances, totalVaultSupplies, totalPlatformSupplies, priceOfSingleToken]);

//     const normalFarms = useMemo(() => {
//         return farms.reduce((farms: FarmDetails[], farm: Farm) => {
//             const lpAddress = getLpAddressForFarmsPrice([farm])[0];
//             if (farm.token_type === FarmType.normal) {
//                 farms.push({
//                     ...farm,
//                     userVaultBalance: usersVaultBalances[farm.vault_addr],
//                     totalVaultBalance: totalVaultSupplies[farm.vault_addr],
//                     totalPlatformBalance: totalPlatformSupplies[farm.lp_address],
//                     priceOfSingleToken: priceOfSingleToken[lpAddress] || (farm.stableCoin ? 1 : 0),
//                     apys: apys[farm.lp_address],
//                 });
//             }
//             return farms;
//         }, []);
//     }, [apys, usersVaultBalances, totalVaultSupplies, totalPlatformSupplies, priceOfSingleToken]);

//     const advancedFarms = useMemo(() => {
//         return farms.reduce((farms: FarmDetails[], farm: Farm) => {
//             const lpAddress = getLpAddressForFarmsPrice([farm])[0];
//             if (farm.token_type === FarmType.advanced) {
//                 farms.push({
//                     ...farm,
//                     userVaultBalance: usersVaultBalances[farm.vault_addr],
//                     totalVaultBalance: totalVaultSupplies[farm.vault_addr],
//                     totalPlatformBalance: totalPlatformSupplies[farm.lp_address],
//                     priceOfSingleToken: priceOfSingleToken[lpAddress] || (farm.stableCoin ? 1 : 0),
//                     apys: apys[farm.lp_address],
//                 });
//             }
//             return farms;
//         }, []);
//     }, [apys, usersVaultBalances, totalVaultSupplies, totalPlatformSupplies, priceOfSingleToken]);

//     return {
//         farmDetails,
//         normalFarms,
//         advancedFarms,
//         isLoading:
//             isLoadingApys ||
//             isLoadingPricesOfSingleToken ||
//             isLoadingTotalPlatformSupplies ||
//             isLoadingTotalVaultSupplies,
//     };
// };
