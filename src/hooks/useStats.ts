import React, { useEffect, useState } from "react";
import { getUserTVLs, Response } from "src/api/usersTVLs";
import usePriceOfTokens from "./usePriceOfTokens";
import { useDecimals } from "./useDecimals";
import { toEth } from "src/utils/common";
import { getAddress } from "ethers/lib/utils.js";
import useFarms from "./farms/useFarms";

type userTVL = {
    id: string;
    tvl: number;
};

export const useStats = (page: number) => {
    const [users, setUsers] = useState<Response[]>();
    const [userTVLs, setUserTVLs] = useState<userTVL[]>();
    const { prices } = usePriceOfTokens();
    const { decimals } = useDecimals();
    const { farms } = useFarms();

    useEffect(() => {
        setUsersState(page);
    }, [page]);

    useEffect(() => {
        if (!farms || !users) return;
        const abc = users?.map((user) => {
            let usdBalance = 0;
            user.earn.forEach((vault) => {
                const farm = farms.filter((farm) => farm.vault_addr == getAddress(vault.vaultAddress))[0];
                let price = prices[getAddress(farm.lp_address)];
                let decimal = decimals[vault.vaultAddress];
                let balance = toEth(vault.userBalance, decimal);
                usdBalance += price * Number(balance);
            });
            return {
                ...user,
                tvl: usdBalance,
            };
        });
        setUserTVLs(abc);
    }, [users, prices, decimals, farms]);

    const setUsersState = async (page: number) => {
        const users = await getUserTVLs(page);
        setUsers(users);
    };

    return {
        userTVLs,
    };
};
