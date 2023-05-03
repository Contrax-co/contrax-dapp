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

interface IProps {}

enum Tab {
    Wert = "Wert",
    Transak = "Transak",
}

const Buy: React.FC<IProps> = () => {
    const [tab, setTab] = React.useState<Tab>(Tab.Wert);
    const [params, setSearchParams] = useSearchParams();
    const { reloadBalances, balances } = useBalances();
    // const { lock } = useBridge();

    // Reload Balances every time this component unmounts
    React.useEffect(() => {
        reloadBalances();
    }, []);

    // React.useEffect(() => {
    //     lock();
    // }, [balances]);

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

    return (
        <div className={styles.container}>
            <Tabs>
                <PoolButton
                    variant={2}
                    onClick={() => {
                        setTab(Tab.Wert);
                        setSearchParams((params) => {
                            params.set("tab", Tab.Wert);
                            return params;
                        });
                    }}
                    description="Wert"
                    active={tab === Tab.Wert}
                />
                <PoolButton
                    variant={2}
                    onClick={() => {
                        setTab(Tab.Transak);
                        setSearchParams((params) => {
                            params.set("tab", Tab.Transak);
                            return params;
                        });
                    }}
                    description="Transak"
                    active={tab === Tab.Transak}
                />
            </Tabs>
            {tab === Tab.Transak && <Transak />}
            {tab === Tab.Wert && <Wert />}
        </div>
    );
};

export default Buy;
