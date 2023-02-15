import VaultItem from "./VaultItem";
import styles from "./Vaults.module.scss";
import useWallet from "src/hooks/useWallet";
import { defaultChainId } from "src/config/constants";
import useApp from "src/hooks/useApp";
import { useFarmDetails } from "src/hooks/farms/useFarms";
import { EmptyComponent } from "src/components/EmptyComponent/EmptyComponent";

interface Props {}

const Vaults: React.FC<Props> = () => {
    const { lightMode } = useApp();
    const { networkId, signer } = useWallet();
    const { farmDetails: vaults } = useFarmDetails();

    return signer ? (
        <div
            className={styles.vaults_container}
            style={networkId === defaultChainId ? undefined : { display: "block" }}
        >
            {networkId === defaultChainId ? (
                vaults.map((vault) => <VaultItem vault={vault} key={vault.id} />)
            ) : (
                <div className={`change_network_section ${lightMode && styles.change_network_section_light}`}>
                    <p>Please change network to Arbitrum to use the farms</p>
                </div>
            )}
        </div>
    ) : (
        <EmptyComponent>Connect your wallet to view your joined Vaults</EmptyComponent>
    );
};

export default Vaults;
