import VaultItem from "./VaultItem";
import "./Vaults.css";
import useVaults from "src/hooks/vaults/useVaults";
import useWallet from "src/hooks/useWallet";
import { defaultChainId } from "src/config/constants";
import useApp from "src/hooks/useApp";

interface Props {}

const Vaults: React.FC<Props> = () => {
    const { lightMode } = useApp();
    const { vaults } = useVaults();
    const { networkId } = useWallet();

    return (
        <div className={`vaults_container`} style={networkId === defaultChainId ? undefined : { display: "block" }}>
            {networkId === defaultChainId ? (
                vaults.map((vault) => <VaultItem vault={vault} key={vault.id} />)
            ) : (
                <div className={`change_network_section ${lightMode && "change_network_section_light"}`}>
                    <p>Please change network to Arbitrum to use the farms</p>
                </div>
            )}
        </div>
    );
};

export default Vaults;
