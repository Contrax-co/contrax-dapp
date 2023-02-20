import VaultItem from "./VaultItem";
import styles from "./Vaults.module.scss";
import useWallet from "src/hooks/useWallet";
import { defaultChainId } from "src/config/constants";
import { EmptyComponent } from "src/components/EmptyComponent/EmptyComponent";
import { Skeleton } from "src/components/Skeleton/Skeleton";
import { useVaults } from "src/hooks/useVaults";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

interface Props {}
let redirected = false;

const Vaults: React.FC<Props> = () => {
    const { networkId, signer } = useWallet();
    const { vaults, isLoading } = useVaults();
    const navigate = useNavigate();
    const [params] = useSearchParams();

    useEffect(() => {
        if (!isLoading && vaults) {
            if (params.get("redirect") === "false") redirected = true;
            if (!redirected) navigate("/farms");
            redirected = true;
        }
    }, [navigate, params, vaults, isLoading]);

    useEffect(() => {
        console.log(vaults);
    }, [vaults]);

    return signer ? (
        <div
            className={styles.vaults_container}
            style={networkId === defaultChainId && !isLoading && vaults.length > 0 ? undefined : { display: "block" }}
        >
            {!isLoading ? (
                networkId === defaultChainId ? (
                    vaults.length > 0 ? (
                        vaults.map((vault) => <VaultItem vault={vault} key={vault.id} />)
                    ) : (
                        <EmptyComponent>You haven't deposited in any of the farms.</EmptyComponent>
                    )
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
