import { useEffect } from "react";
import "./App.css";
import WalletProvider from "./context/WalletProvider";
import "react-tooltip/dist/react-tooltip.css";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "./styles/global.scss";
import { WagmiConfig } from "wagmi";
import { wagmiClient, chains } from "./config/walletConfig";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import WalletDisclaimer from "./components/WalletDisclaimer/WalletDisclaimer";
import { ReactHooksWrapper, setHook } from "react-hooks-outside";
import { useNotifications } from "reapop";
import { queryClient } from "./config/reactQuery";
import useApp from "./hooks/useApp";
import Body from "./Body";
import { useDispatch } from "react-redux";
import { setOffline, setOnline } from "src/state/internet/internetReducer";
import { resetErrorCount } from "./state/error/errorReducer";

setHook("notifications", useNotifications);

function App() {
    const { lightMode, supportChat, toggleSupportChat } = useApp();
    const dispatch = useDispatch();

    window.addEventListener("online", () => {
        dispatch(setOnline());
        dispatch(resetErrorCount());
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
                        <Body />
                        <ReactHooksWrapper />
                    </WalletProvider>
                    <ReactQueryDevtools />
                </RainbowKitProvider>
            </WagmiConfig>
        </QueryClientProvider>
    );
}

export default App;
