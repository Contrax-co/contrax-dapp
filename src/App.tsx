import "./App.css";
import WalletProvider from "./context/WalletProvider";
import "react-tooltip/dist/react-tooltip.css";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "./styles/global.scss";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactHooksWrapper, setHook } from "react-hooks-outside";
import { useNotifications } from "reapop";
import { queryClient } from "./config/reactQuery";
import Body from "./Body";
import { BrowserRouter as Router } from "react-router-dom";

setHook("notifications", useNotifications);

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <WalletProvider>
                <Router>
                    <Body />
                </Router>
                <ReactHooksWrapper />
            </WalletProvider>
            <ReactQueryDevtools />
        </QueryClientProvider>
    );
}

export default App;
