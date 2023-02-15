import { getHook } from "react-hooks-outside";
import { Notification } from "reapop";

export const notifySuccess = (title: string, message: string) => {
    const { notify } = getHook("notifications");
    notify({
        title,
        message,
        status: "success",
    });
};
export const notifyError = (title: string, message: string) => {
    const { notify } = getHook("notifications");
    notify({
        title,
        message,
        status: "error",
    });
};

export const notifyLoading = (title: string, message: string, options?: Partial<Notification>) => {
    const { notify } = getHook("notifications");
    let nt = notify({
        title,
        message,
        status: "loading",
        dismissAfter: 0,
        dismissible: false,
        ...options,
    });
    return nt.id as string;
};

export const dismissNotify = (id: string) => {
    const { dismissNotification } = getHook("notifications");
    dismissNotification(id);
};
export const dismissNotifyAll = () => {
    const { dismissNotifications } = getHook("notifications");
    dismissNotifications();
};
