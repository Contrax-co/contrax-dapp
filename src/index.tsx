import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "src/config/walletConfig";
import { setUpNotifications, NotificationsProvider } from "reapop";
import Notifications from "./components/Notifications/Notifications";

import { WagmiConfig } from "wagmi";
import { wagmiClient, chains } from "./config/walletConfig";
import "@rainbow-me/rainbowkit/styles.css";
import Logo from "src/assets/images/logo.png";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import WalletDisclaimer from "./components/WalletDisclaimer/WalletDisclaimer";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
        },
    },
});

// Configuration for toast notifications
setUpNotifications({
    defaultProps: {
        position: "top-right",
        dismissible: true,
        showDismissButton: true,
        dismissAfter: 3000,
    },
});

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(
    <QueryClientProvider client={queryClient}>
        <WagmiConfig client={wagmiClient}>
            <RainbowKitProvider
                chains={chains}
                showRecentTransactions={false}
                appInfo={{ appName: "Contrax", disclaimer: WalletDisclaimer }}
            >
                <React.StrictMode>
                    <NotificationsProvider>
                        <App />
                        <Notifications />
                    </NotificationsProvider>
                </React.StrictMode>
            </RainbowKitProvider>
        </WagmiConfig>
    </QueryClientProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
