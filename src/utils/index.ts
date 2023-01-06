export const copyToClipboard = (text: string, cb: Function | null = null) => {
    navigator.clipboard.writeText(text);
    setTimeout(() => {
        if (cb) cb();
    }, 1000);
};
