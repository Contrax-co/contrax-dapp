import { useMemo } from "react";
import useApp from "src/hooks/useApp";
import useVaultBalances from "src/hooks/vaults/useVaultBalances";
import { Vault } from "src/types";
import "./VaultItem.css";
import usePriceOfToken from "src/hooks/usePriceOfToken";
import useVaultTotalSupply from "src/hooks/vaults/useVaultTotalSupply";
import { findTotalAPY, totalFarmAPY } from "src/utils/common";
import useFeeApy from "src/hooks/useFeeApy";
import useFarmApy from "src/hooks/farms/useFarmApy";

interface Props {
    vault: Vault;
}

const VaultItem: React.FC<Props> = ({ vault }) => {
    const { lightMode } = useApp();

    const { formattedBalances } = useVaultBalances();
    const tokenAmount = useMemo(() => {
        return formattedBalances[vault.vault_address];
    }, [formattedBalances, vault]);

    const { formattedSupplies } = useVaultTotalSupply();
    const vaultAmount = useMemo(() => {
        return formattedSupplies[vault.vault_address];
    }, [formattedSupplies, vault]);

    const { price } = usePriceOfToken(vault.lp_address);

    const { apy: feeAPY } = useFeeApy(vault.lp_address);

    const { apy: rewardAPY } = useFarmApy(vault.lp_address);

    const apyVisionAPY = useMemo(() => totalFarmAPY(rewardAPY, feeAPY), [rewardAPY, feeAPY]);
    const totalAPY = useMemo(() => findTotalAPY(vault.rewards_apy || 0, vault.total_apy || 0, vault.platform), [vault]);

    return (
        <div>
            {tokenAmount * price < 0.01 ? null : (
                <div className={`vault_item ${lightMode && "vault_item--light"}`}>
                    <div className={`vault_item_images`}>
                        {vault.alt1 ? <img className={`vault_item_logo1`} alt={vault.alt1} src={vault.logo1} /> : null}

                        {vault.alt2 ? <img className={`vault_item_logo2`} alt={vault.alt2} src={vault.logo2} /> : null}

                        <p className={`vault_item_name`}>{vault.name}</p>
                    </div>

                    <div className={`vault_items_bottom_header`}>
                        <div className={`vault_items_bottom_row`}>
                            <div className={`vault_items_bottom_categories`}>
                                <p className={`vault_items_title ${lightMode && "vault_items_title--light"}`}>
                                    Your Stake
                                </p>
                                <p>
                                    {(tokenAmount * price).toLocaleString("en-US", {
                                        style: "currency",
                                        currency: "USD",
                                    })}
                                </p>
                            </div>

                            <div className={`vault_items_bottom_categories`}>
                                <p className={`vault_items_title ${lightMode && "vault_items_title--light"}`}>
                                    Pool Share
                                </p>
                                <p>{((tokenAmount / vaultAmount) * 100).toFixed(2)}%</p>
                            </div>
                        </div>

                        <div className={`vault_items_bottom_row`}>
                            <div className={`vault_items_bottom_categories`}>
                                <p className={`vault_items_title ${lightMode && "vault_items_title--light"}`}>APY</p>
                                {!vault.total_apy ? <p> {apyVisionAPY.toFixed(2)}%</p> : <p> {totalAPY.toFixed(2)}%</p>}
                            </div>

                            <div className={`vault_items_bottom_categories`}>
                                <p className={`vault_items_title ${lightMode && "vault_items_title--light"}`}>
                                    Liquidity
                                </p>
                                <p>
                                    {(vaultAmount * price).toLocaleString("en-US", {
                                        style: "currency",
                                        currency: "USD",
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VaultItem;
