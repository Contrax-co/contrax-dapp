import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import WalletProvider from "./context/WalletProvider";
import Farms from "src/pages/Farms/Farms";
import CreateToken from "src/pages/CreateToken/CreateToken";
import CreatePool from "src/pages/CreatePool/CreatePool";
import Dashboard from "src/pages/Dashboard/Dashboard";
import "react-tooltip/dist/react-tooltip.css";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Exchange from "./pages/Exchange/Exchange";
import "./styles/global.scss";

import { WagmiConfig } from "wagmi";
import { wagmiClient, chains } from "./config/walletConfig";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClientProvider } from "@tanstack/react-query";

import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import WalletDisclaimer from "./components/WalletDisclaimer/WalletDisclaimer";
import Test from "./pages/Test/Test";
import { ReactHooksWrapper, setHook } from "react-hooks-outside";
import { useNotifications } from "reapop";
import { queryClient } from "./config/reactQuery";
import useApp from "./hooks/useApp";

setHook("notifications", useNotifications);

function Body() {
    const { lightMode } = useApp();
    return (
        <QueryClientProvider client={queryClient}>
            <WagmiConfig client={wagmiClient}>
                <RainbowKitProvider
                    chains={chains}
                    theme={lightMode ? lightTheme() : darkTheme()}
                    showRecentTransactions={false}
                    appInfo={{ appName: "Contrax", disclaimer: WalletDisclaimer }}
                >
                    <WalletProvider>
                        <Router>
                            <Routes>
                                <Route path="/" element={<Home />}>
                                    <Route path="" element={<Dashboard />} />
                                    <Route path="/farms" element={<Farms />} />
                                    <Route path="/exchange" element={<Exchange />} />
                                    {/* <Route path="create-token" element={<CreateToken />} />
                                    <Route path="create-pool" element={<CreatePool />} /> */}
                                    <Route path="test" element={<Test />} />
                                    <Route path="*" element={<h3 style={{ color: "white" }}>Not Found</h3>} />
                                </Route>
                            </Routes>
                        </Router>
                        <ReactHooksWrapper />
                    </WalletProvider>
                    <ReactQueryDevtools />
                </RainbowKitProvider>
            </WagmiConfig>
        </QueryClientProvider>
    );
}

export default Body;
