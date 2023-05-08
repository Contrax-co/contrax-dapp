import useFarmDetails from "src/hooks/farms/useFarmDetails";
import useApp from "src/hooks/useApp";
import { Vault } from "src/types";
import { toFixedFloor } from "src/utils/common";
import "./VaultItem.css";
import { GoArrowUp, GoArrowDown } from "react-icons/go";
import { useAppSelector } from "src/state";
import { DeprecatedChip } from "src/components/FarmItem/components/Chip/DeprecatedChip";
import { Skeleton } from "src/components/Skeleton/Skeleton";

interface Props {
    vault: Vault;
}

const VaultItem: React.FC<Props> = ({ vault }) => {
    const { lightMode } = useApp();
    const { oldPrice, isLoading: isLoadingOldData } = useOldPrice(vault.lp_address);

    const {
        userVaultBalance,
        priceOfSingleToken,
        apys: { apy },
        id,
    } = vault;

    return (
        <div className={`vaults`}>
            <div>
                <div className={`outlinedContainer vault_item  ${lightMode && "vault_item--light"}`}>
                    <div className={`vault_item_images`}>
                        {vault.alt1 ? <img className={`vault_item_logo1`} alt={vault.alt1} src={vault.logo1} /> : null}

                        {vault.alt2 ? <img className={`vault_item_logo2`} alt={vault.alt2} src={vault.logo2} /> : null}

                        <p className={`vault_item_name`}>
                            {vault.name}
                            {vault.isDeprecated && <DeprecatedChip top="24px" />}
                        </p>
                    </div>

                    <div className={`vault_items_bottom_header`}>
                        <div className={`vault_items_bottom_row`}>
                            <div className={`vault_items_bottom_categories`}>
                                <p className={`vault_items_title ${lightMode && "vault_items_title--light"}`}>
                                    Your Stake
                                </p>
                                <div style={{ display: "flex", alignItems: "flex-end" }}>
                                    <p style={{ margin: 0 }}>
                                        {(userVaultBalance * priceOfSingleToken)
                                            .toLocaleString("en-US", {
                                                style: "currency",
                                                currency: "USD",
                                                minimumFractionDigits: 3,
                                            })
                                            .slice(0, -1)}
                                    </p>
                                    {isLoadingOldData && <Skeleton w={45} h={16} style={{ marginLeft: 5 }} />}
                                    {!isLoadingOldData &&
                                        oldPrice &&
                                        Number(
                                            (
                                                userVaultBalance * priceOfSingleToken -
                                                userVaultBalance * oldPrice[0].price
                                            ).toFixed(2)
                                        ) !== 0 &&
                                        (oldPrice[0].price > priceOfSingleToken ? (
                                            <span
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <GoArrowDown style={{ color: "red" }} />
                                                <p style={{ margin: 0, fontSize: 10 }}>
                                                    {Math.abs(
                                                        userVaultBalance * priceOfSingleToken -
                                                            userVaultBalance * oldPrice[0].price
                                                    ).toLocaleString("en-US", {
                                                        style: "currency",
                                                        currency: "USD",
                                                    })}
                                                </p>
                                            </span>
                                        ) : (
                                            <span
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <GoArrowUp style={{ color: "lime" }} />
                                                <p style={{ margin: 0, fontSize: 10 }}>
                                                    {Math.abs(
                                                        userVaultBalance * oldPrice[0].price -
                                                            userVaultBalance * priceOfSingleToken
                                                    ).toLocaleString("en-US", {
                                                        style: "currency",
                                                        currency: "USD",
                                                    })}
                                                </p>
                                            </span>
                                        ))}
                                </div>
                            </div>

                            <div className={`vault_items_bottom_categories`}>
                                <p className={`vault_items_title ${lightMode && "vault_items_title--light"}`}>APY</p>
                                <p>
                                    {toFixedFloor(apy || 0, 2) == 0
                                        ? "--"
                                        : apy < 0.01
                                        ? `${apy.toPrecision(2).slice(0, -1)}%`
                                        : `${toFixedFloor(apy, 2).toString()}%`}
                                </p>
                            </div>
                            {/* <div className={`vault_items_bottom_categories`}>
                                <p className={`vault_items_title ${lightMode && "vault_items_title--light"}`}>Earned</p>
                                <p>
                                    {(earnings[id] ?? 0).toLocaleString("en-US", {
                                        style: "currency",
                                        currency: "USD",
                                    })}
                                </p>
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VaultItem;

function useOldPrice(address: string) {
    const { isLoadingEarnings } = useFarmDetails();
    const oldPrice = useAppSelector((state) => state.prices.oldPrices[address]);
    const isLoadingOldPrices = useAppSelector((state) => state.prices.isLoadingOldPrices);

    return { oldPrice, isLoading: isLoadingEarnings || isLoadingOldPrices };
}
