import useApp from "src/hooks/useApp";
import { FarmDetails } from "src/types";
import "./VaultItem.css";

interface Props {
    vault: FarmDetails;
}

const VaultItem: React.FC<Props> = ({ vault }) => {
    const { lightMode } = useApp();

    const {
        userVaultBalance,
        totalVaultBalance,
        priceOfSingleToken,
        apys: { apy },
    } = vault;

    if (userVaultBalance * priceOfSingleToken >= 0.01)
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
                                        {(userVaultBalance * priceOfSingleToken).toLocaleString("en-US", {
                                            style: "currency",
                                            currency: "USD",
                                        })}
                                    </p>
                                </div>

                                <div className={`vault_items_bottom_categories`}>
                                    <p className={`vault_items_title ${lightMode && "vault_items_title--light"}`}>
                                        Pool Share
                                    </p>
                                    <p>{((userVaultBalance / totalVaultBalance) * 100).toFixed(2)}%</p>
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
                                        {(totalVaultBalance * priceOfSingleToken).toLocaleString("en-US", {
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
