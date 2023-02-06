import { useMemo } from "react";
import useApp from "src/hooks/useApp";
import useVaultBalances from "src/hooks/vaults/useVaultBalances";
import { Vault } from "src/types";
import "./VaultItem.css";
import useVaultTotalSupply from "src/hooks/vaults/useVaultTotalSupply";
import { totalFarmAPY } from "src/utils/common";
import useFeeApy from "src/hooks/useFeeApy";
import useFarmApy from "src/hooks/farms/useFarmApy";
import usePriceOfTokens from "src/hooks/usePriceOfTokens";

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

    const {
        prices: { [vault.lp_address]: price },
    } = usePriceOfTokens([vault.lp_address]);

    const { apy, compounding, feeApr, rewardsApr } = useFarmApy(vault);

    if (tokenAmount * price >= 0.01)
        return (
            <div className={`vaults`}>
                <div>
                    <div className={`vault_item ${lightMode && "vault_item--light"}`}>
                        <div className={`vault_item_images`}>
                            {vault.alt1 ? (
                                <img className={`vault_item_logo1`} alt={vault.alt1} src={vault.logo1} />
                            ) : null}

                            {vault.alt2 ? (
                                <img className={`vault_item_logo2`} alt={vault.alt2} src={vault.logo2} />
                            ) : null}

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
                                    <p className={`vault_items_title ${lightMode && "vault_items_title--light"}`}>
                                        APY
                                    </p>
                                    <p> {apy.toFixed(2)}%</p>
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
                </div>
            </div>
        );
    else return null;
};

export default VaultItem;
