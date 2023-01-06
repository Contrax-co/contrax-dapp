import VaultItem from "./VaultItem";
import "./Vaults.css";
import { Vault } from "src/types";

interface Props {
    vaults: Vault[];
}

const Vaults: React.FC<Props> = ({ vaults }) => {
    return (
        <div className={`vaults_container`}>
            {vaults.map((vault) => (
                <div className={`vaults`}>
                    <VaultItem key={vault.id} vault={vault} />
                </div>
            ))}
        </div>
    );
};

export default Vaults;
