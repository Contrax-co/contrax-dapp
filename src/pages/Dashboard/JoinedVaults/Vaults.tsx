import VaultItem from "./VaultItem";
import styles from "./Vaults.module.scss";
import useWallet from "src/hooks/useWallet";
import { defaultChainId } from "src/config/constants";
import { useFarmDetails } from "src/hooks/farms/useFarms";
import { EmptyComponent } from "src/components/EmptyComponent/EmptyComponent";
import { Skeleton } from "src/components/Skeleton/Skeleton";

interface Props {}

const Vaults: React.FC<Props> = () => {
    const { networkId, signer } = useWallet();
    const { farmDetails: vaults, isLoading } = useFarmDetails();

    return signer ? (
        <div
            className={styles.vaults_container}
            style={networkId === defaultChainId ? undefined : { display: "block" }}
        >
            {!isLoading ? (
                networkId === defaultChainId ? (
                    vaults.map((vault) => <VaultItem vault={vault} key={vault.id} />)
                ) : (
                    <EmptyComponent>Change network to Arbitrum to view your joined Vaults</EmptyComponent>
                )
            ) : (
                <Skeleton w={"100%"} h={250} bg={"#012243"} bRadius={20} />
            )}
        </div>
    ) : (
        <EmptyComponent>Connect your wallet to view your joined Vaults</EmptyComponent>
    );
};

export default Vaults;
