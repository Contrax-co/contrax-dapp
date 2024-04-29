import "./polyfills";
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import "./config/walletConfig";
import { setUpNotifications, NotificationsProvider } from "reapop";
import Notifications from "./components/Notifications/Notifications";
import { Provider } from "react-redux";
import store, { persistor } from "./state";
import { PersistGate } from "redux-persist/integration/react";
import AppProvider from "./context/AppProvider";
import "src/api/interceptor";
import { supportChatConfig } from "./config/supportChat";

// Configuration for toast notifications
setUpNotifications({
    defaultProps: {
        position: "top-right",
        dismissible: true,
        showDismissButton: true,
        dismissAfter: 3000,
    },
});
supportChatConfig(window, document);

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <NotificationsProvider>
                    <AppProvider>
                        <App />
                        <Notifications />
                    </AppProvider>
                </NotificationsProvider>
            </PersistGate>
        </Provider>
    </React.StrictMode>
);
