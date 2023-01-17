import VaultItem from "./VaultItem";
import "./Vaults.css";
import useVaults from "src/hooks/vaults/useVaults";

interface Props {}

const Vaults: React.FC<Props> = () => {
    const { vaults } = useVaults();

    return (
        <div className={`vaults_container`}>
            {vaults.map((vault) => (
                <div className={`vaults`} key={vault.id}>
                    <VaultItem vault={vault} />
                </div>
            ))}
        </div>
    );
};

export default Vaults;
