import { useEffect } from "react";
import "./App.css";
import WalletProvider from "./context/WalletProvider";
import "react-tooltip/dist/react-tooltip.css";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "./styles/global.scss";
import { QueryClientProvider } from "@tanstack/react-query";
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
