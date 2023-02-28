import VaultItem from "./VaultItem";
import styles from "./Vaults.module.scss";
import useWallet from "src/hooks/useWallet";
import { defaultChainId } from "src/config/constants";
import { EmptyComponent } from "src/components/EmptyComponent/EmptyComponent";
import { Skeleton } from "src/components/Skeleton/Skeleton";
import { useVaults } from "src/hooks/useVaults";
import { Link } from "react-router-dom";
import useApp from "src/hooks/useApp";

interface Props {}

const Vaults: React.FC<Props> = () => {
    const { lightMode } = useApp();
    const { networkId, currentWallet } = useWallet();
    const { vaults, isLoading } = useVaults();

    return currentWallet ? (
        <div
            className={styles.vaults_container}
            style={networkId === defaultChainId && !isLoading && vaults.length > 0 ? undefined : { display: "block" }}
        >
            {!isLoading ? (
                networkId === defaultChainId ? (
                    vaults.length > 0 ? (
                        vaults.map((vault) => <VaultItem vault={vault} key={vault.id} />)
                    ) : (
                        <EmptyComponent>
                            You haven't deposited in any of the farms.{" "}
                            <Link to={"/farms"} style={{ color: lightMode ? "#61cddf" : "#009aff" }}>
                                Go to Farms
                            </Link>
                        </EmptyComponent>
                    )
                ) : (
                    <EmptyComponent>Change network to Arbitrum to view your joined Vaults</EmptyComponent>
                )
            ) : (
                <Skeleton w={"100%"} h={250} bRadius={20} inverted={true} />
            )}
        </div>
    ) : (
        <EmptyComponent>Connect your wallet to view your joined Vaults</EmptyComponent>
    );
};

export default Vaults;
