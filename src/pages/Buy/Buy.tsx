import React from "react";
import useWallet from "src/hooks/useWallet";
import styles from "./Buy.module.scss";
import PoolButton from "src/components/PoolButton/PoolButton";
import { Tabs } from "src/components/Tabs/Tabs";
import { useSearchParams } from "react-router-dom";
import useBalances from "src/hooks/useBalances";
import Transak from "./Transak";
import Wert from "./Wert";
import { useAppSelector } from "src/state";
import useBridge from "src/hooks/useBridge";
import useAccountData from "src/hooks/useAccountData";
import { TiWarningOutline } from "react-icons/ti";
import { NotSignedIn } from "src/components/NotSignedIn/NotSignedIn";
import Gatefi from "./Gatefi";
import Front from "./Front";

interface IProps {}

enum Tab {
    Wert = "Wert",
    Transak = "Transak",
    Gatefi = "Gatefi",
    Front = "Front",
}

const Buy: React.FC<IProps> = () => {
    const [tab, setTab] = React.useState<Tab>(Tab.Wert);
    const [params, setSearchParams] = useSearchParams();
    const { reloadBalances, balances } = useBalances();
    const { fetchAccountData } = useAccountData();
    const { currentWallet } = useWallet();
    // const { lock } = useBridge();

    // Reload Balances every time this component unmounts
    React.useEffect(() => {
        // TODO: make request on page change
        return () => {
            reloadBalances();
        };
    }, []);

    React.useEffect(() => {
        // TODO: make request on page change
        return () => {
            fetchAccountData();
        };
    }, []);

    // Check for query params regarding tab, if none, default = Buy
    React.useEffect(() => {
        let tab = params.get("tab");
        if (tab) setTab(tab as Tab);
        else
            setSearchParams((params) => {
                params.set("tab", Tab.Wert);
                return params;
            });
    }, [params]);

    return currentWallet ? (
        <div className={styles.container}>
            <h5>Fund Your Account</h5>
            <p>
                Limited Promotion! New Buyers get <b>$5</b> in USDC (minimum $30)
            </p>
            <small>Note: If Wert isn't supported for you, use Transak</small>

            <Tabs>
                {Object.values(Tab).map((_tab, i) => (
                    <PoolButton
                        key={i}
                        variant={2}
                        onClick={() => {
                            setTab(_tab);
                            setSearchParams((params) => {
                                params.set("tab", _tab);
                                return params;
                            });
                        }}
                        description={_tab}
                        active={tab === _tab}
                    />
                ))}
            </Tabs>
            {tab === Tab.Transak && <Transak />}
            {tab === Tab.Wert && <Wert />}
            {tab === Tab.Gatefi && <Gatefi />}
            {tab === Tab.Front && <Front />}
        </div>
    ) : (
        <NotSignedIn />
    );
};

export default Buy;
