import pools from "src/config/constants/pools.json";
import { Farm, FarmData } from "src/types";
import { constants, providers, BigNumber } from "ethers";
import { getBalance, getPrice } from "src/api/token";
import { defaultChainId } from "src/config/constants";
import { toEth } from "src/utils/common";

const farm = pools.find((farm) => farm.id === 3) as Farm;

export const getFarmData = async (
    provider: providers.Provider,
    currentWallet: string,
    _ethBalance?: BigNumber
): Promise<FarmData> => {
    const ethPrice = await getPrice(constants.AddressZero, defaultChainId);
    const ethBalance = !!_ethBalance ? _ethBalance : await provider.getBalance(currentWallet);
    const lpPrice = await getPrice(farm.lp_address, defaultChainId);
    const lpBalance = await getBalance(farm.lp_address, currentWallet, provider);
    const vaultBalance = await getBalance(farm.vault_addr, currentWallet, provider);

    return {
        Max_Zap_Withdraw_Balance_Dollar: (Number(toEth(vaultBalance)) * lpPrice).toString(),
        Max_Zap_Withdraw_Balance: ((Number(toEth(vaultBalance)) * lpPrice) / ethPrice).toString(),
        Max_Token_Withdraw_Balance: toEth(vaultBalance),
        Max_Token_Withdraw_Balance_Dollar: (Number(toEth(vaultBalance)) * lpPrice).toString(),
        Max_Token_Deposit_Balance: toEth(lpBalance),
        Max_Token_Deposit_Balance_Dollar: (Number(toEth(lpBalance)) * lpPrice).toString(),
        Max_Zap_Deposit_Balance_Dollar: (Number(toEth(ethBalance)) * ethPrice).toString(),
        Max_Zap_Deposit_Balance: toEth(ethBalance),
        Token_Token_Symbol: farm.name,
        Zap_Token_Symbol: "ETH",
        Token_Deposit_Token_Address: farm.lp_address,
        Token_Withdraw_Token_Address: farm.lp_address,
        Zap_Deposit_Token_Address: constants.AddressZero,
        Zap_Withdraw_Token_Address: constants.AddressZero,
    };
};
