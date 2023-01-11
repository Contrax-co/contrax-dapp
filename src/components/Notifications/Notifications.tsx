import React from "react";
import NotificationsSystem, { useNotifications, baseTheme, atalhoTheme, Notification, Theme } from "reapop";

interface IProps {}

const customTheme: Theme = {
    ...baseTheme,
    ...atalhoTheme,

    notification: (notification: Notification) => ({
        ...atalhoTheme.notification(notification),
        borderRadius: "10px",
        width: "auto",
        minWidth: "300px",
        backgroundColor: "#032a51",
    }),

    notificationMeta: (notification: Notification) => ({
        ...atalhoTheme.notificationMeta(notification),
        verticalAlign: "top",
        width: "100%",
        padding: "10px 20px",
        paddingBottom: 12,
    }),
    notificationTitle: (notification: Notification) => ({
        ...atalhoTheme.notificationMessage(notification),
        margin: notification.message ? "0 0 10px" : 0,
        fontSize: "16px",
        color: "#ffffff",
        fontWeight: 700,
    }),
    notificationMessage: (notification: Notification) => ({
        ...atalhoTheme.notificationMessage(notification),
        fontSize: "12px",
        color: "#fff",
    }),
    notificationButton: (notification, position, state) => ({
        ...atalhoTheme.notificationButton(notification, position, state),
        background: "transparent",
    }),
};

const Notifications: React.FC<IProps> = () => {
    console.log("old theme", atalhoTheme);

    // 1. Retrieve the notifications to display, and the function used to dismiss a notification.
    const { notifications, dismissNotification } = useNotifications();
    return (
        <NotificationsSystem
            // 2. Pass the notifications you want Reapop to display.
            notifications={notifications}
            // 3. Pass the function used to dismiss a notification.
            dismissNotification={(id) => dismissNotification(id)}
            // 4. Pass a builtIn theme or a custom theme.
            theme={customTheme}
        />
    );
};

export default Notifications;
