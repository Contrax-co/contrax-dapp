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

interface IProps {}

enum Tab {
    Wert = "Wert",
    Transak = "Transak",
}

const Buy: React.FC<IProps> = () => {
    const [tab, setTab] = React.useState<Tab>(Tab.Wert);
    const [params, setSearchParams] = useSearchParams();
    const { reloadBalances, balances } = useBalances();
    const { fetchAccountData } = useAccountData();
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

    return (
        <div className={styles.container}>
            <h5>Fund Your Account</h5>
            <p>
                Limited Promotion! New Buyers get <b>$5</b> in USDC
            </p>
            <p>USDC is auto-bridged to arbitrum on purchase*</p>
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
