import VaultItem from "./VaultItem";
import "./Vaults.css";

function Vaults({ vaults, singlePrice, setSinglePrice }: any) {
    return (
        <div className={`vaults_container`}>
            {vaults.map((vault: any) => (
                <div className={`vaults`}>
                    <VaultItem key={vault.id} vault={vault} />
                </div>
            ))}
        </div>
    );
}

export default Vaults;
