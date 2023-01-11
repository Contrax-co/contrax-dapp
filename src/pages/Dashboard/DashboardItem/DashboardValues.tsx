import { useMemo } from "react";
import useBalances from "src/hooks/useBalances";
import { Vault } from "src/types";
import "./DashboardValue.css";

interface Props {
    vault: Vault;
}

const DashboardValues: React.FC<Props> = ({ vault }) => {
    const { formattedBalances } = useBalances([{ address: vault.vault_address, decimals: vault.decimals || 18 }]);
    const userVaultBalance = useMemo(() => formattedBalances[vault.vault_address], [formattedBalances]);

    return (
        <div>
            <p>Wallets</p>
            <div>{userVaultBalance.toFixed(5)}</div>
        </div>
    );
};

export default DashboardValues;
