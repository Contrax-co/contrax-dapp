import { useEffect } from "react";
import "./App.css";
import WalletProvider from "./context/WalletProvider";
import "react-tooltip/dist/react-tooltip.css";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { WagmiConfig } from "wagmi";
import { wagmiClient, chains } from "./config/walletConfig";
import "@rainbow-me/rainbowkit/styles.css";
import "./styles/global.scss";
import { QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import WalletDisclaimer from "./components/WalletDisclaimer/WalletDisclaimer";
import { ReactHooksWrapper, setHook } from "react-hooks-outside";
import { useNotifications } from "reapop";
import { queryClient } from "./config/reactQuery";
import useApp from "./hooks/useApp";
import Body from "./Body";
import { useDispatch } from "react-redux";
import { setOffline } from "src/state/internet/internetReducer";
import { BrowserRouter as Router } from "react-router-dom";

setHook("notifications", useNotifications);

function App() {
    const { lightMode, supportChat, toggleSupportChat } = useApp();
    const dispatch = useDispatch();

    window.addEventListener("online", () => {
        window.location.reload();
    });
    window.addEventListener("offline", () => {
        dispatch(setOffline());
    });

    useEffect(() => {
        // @ts-ignore
        if (supportChat) window.chaport.q("startSession");
        // @ts-ignore
        else window.chaport.q("stopSession");
    }, [supportChat]);

    return (
        <QueryClientProvider client={queryClient}>
            <WagmiConfig client={wagmiClient}>
                <RainbowKitProvider
                    chains={chains}
                    theme={
                        lightMode
                            ? lightTheme({
                                  accentColor: "var(--color_primary)",
                                  accentColorForeground: "white",
                              })
                            : darkTheme({
                                  accentColor: "var(--color_primary)",
                                  accentColorForeground: "white",
                              })
                    }
                    showRecentTransactions={false}
                    appInfo={{ appName: "Contrax", disclaimer: WalletDisclaimer }}
                >
                    <WalletProvider>
                        <Router>
                            <Body />
                        </Router>
                        <ReactHooksWrapper />
                    </WalletProvider>
                    <ReactQueryDevtools />
                </RainbowKitProvider>
            </WagmiConfig>
        </QueryClientProvider>
    );
}

export default App;
