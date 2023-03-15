import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "src/config/walletConfig";
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

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(
    <React.StrictMode>
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <NotificationsProvider>
                    <AppProvider>
                        <App />
                    </AppProvider>
                    <Notifications />
                </NotificationsProvider>
            </PersistGate>
        </Provider>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
