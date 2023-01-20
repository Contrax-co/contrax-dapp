import VaultItem from "./VaultItem";
import "./Vaults.css";
import useVaults from "src/hooks/vaults/useVaults";

interface Props {}

const Vaults: React.FC<Props> = () => {
    const { vaults } = useVaults();

    return (
        <div className={`vaults_container`}>
            {vaults.map((vault) => (
                <VaultItem vault={vault} key={vault.id} />
            ))}
        </div>
    );
};

export default Vaults;
