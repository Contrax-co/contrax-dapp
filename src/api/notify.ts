import { getHook } from "react-hooks-outside";
import { Notification } from "reapop";
import { NotifyMessage } from "src/types";

export const notifySuccess = (successMessage: NotifyMessage, options?: Partial<Notification>) => {
    const { notify } = getHook("notifications");
    notify({
        title: successMessage.title,
        message: successMessage.message,
        status: "success",
        ...options,
    });
};

export const notifyError = (errorMessage: NotifyMessage) => {
    const { notify } = getHook("notifications");
    notify({
        title: errorMessage.title,
        message: errorMessage.message,
        status: "error",
    });
};

export const notifyLoading = (loadingMessage: NotifyMessage, options?: Partial<Notification>) => {
    const { notify } = getHook("notifications");
    let nt = notify({
        title: loadingMessage.title,
        message: loadingMessage.message,
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
