import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import WalletProvider from "./context/WalletProvider";
import Farms from "src/pages/Farms/Farms";
import CreateToken from "src/pages/CreateToken/CreateToken";
import CreatePool from "src/pages/CreatePool/CreatePool";
import Dashboard from "src/pages/Dashboard/Dashboard";
import AppProvider from "src/context/AppProvider";
import "react-tooltip/dist/react-tooltip.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { web3onboard } from "./config/walletConfig";
import { Web3OnboardProvider } from "@web3-onboard/react";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
        },
    },
});

function App() {
    return (
        <Web3OnboardProvider web3Onboard={web3onboard}>
            <QueryClientProvider client={queryClient}>
                <WalletProvider>
                    <AppProvider>
                        <Router>
                            <Routes>
                                <Route path="/" element={<Home />}>
                                    <Route path="" element={<Farms />} />
                                    <Route path="dashboard" element={<Dashboard />} />
                                    <Route path="create-token" element={<CreateToken />} />
                                    <Route path="create-pool" element={<CreatePool />} />
                                </Route>
                            </Routes>
                        </Router>
                    </AppProvider>
                </WalletProvider>
            </QueryClientProvider>
        </Web3OnboardProvider>
    );
}

export default App;
