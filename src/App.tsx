import "./App.css";
import "react-tooltip/dist/react-tooltip.css";
import "@rainbow-me/rainbowkit/styles.css";
import WalletProvider from "./context/WalletProvider";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "./styles/global.scss";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactHooksWrapper, setHook } from "react-hooks-outside";
import { useNotifications } from "reapop";
import { queryClient } from "./config/reactQuery";
import Body from "./Body";
import { BrowserRouter as Router } from "react-router-dom";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { rainbowConfig } from "./config/walletConfig";
import useApp from "./hooks/useApp";
import WalletDisclaimer from "./components/WalletDisclaimer/WalletDisclaimer";

setHook("notifications", useNotifications);

function App() {
    const { lightMode } = useApp();
    return (
        <QueryClientProvider client={queryClient}>
            <WagmiProvider config={rainbowConfig}>
                <RainbowKitProvider
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
            </WagmiProvider>
        </QueryClientProvider>
    );
}

export default App;
