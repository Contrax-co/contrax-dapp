import { useCallback } from "react";
import { useNotifications, NotificationButton, Notification } from "reapop";

const useNotify = () => {
    const { notify, dismissNotification, dismissNotifications } = useNotifications();
    const notifySuccess = useCallback((title: string, message: string) => {
        notify({
            title,
            message,
            status: "success",
        });
    }, []);

    const notifyError = useCallback((title: string, message: string) => {
        notify({
            title,
            message,
            status: "error",
        });
    }, []);

    const notifyLoading = useCallback((title: string, message: string, options?: Partial<Notification>) => {
        let nt = notify({
            title,
            message,
            status: "loading",
            dismissAfter: 0,
            dismissible: false,
            ...options,
        });
        return nt.id;
    }, []);

    const dismissNotify = useCallback((id: string) => dismissNotification(id), []);
    const dismissNotifyAll = useCallback(() => dismissNotifications(), []);

    return {
        notifySuccess,
        notifyError,
        notifyLoading,
        dismissNotify,
        dismissNotifyAll,
    };
};

export default useNotify;
