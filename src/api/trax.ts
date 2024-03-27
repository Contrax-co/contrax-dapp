import { traxApi } from ".";

interface MessageResponse {
    data: string;
    status: boolean;
}

interface SignatureResponse {
    data: boolean;
    status: boolean;
}

export const getMessage = async () => {
    const res = await traxApi.get<MessageResponse>("get-message");
    return res.data.data;
};

export const acceptTerms = async (address: string, signature: string) => {
    const res = await traxApi.post<SignatureResponse>("accept-terms", {
        address,
        signature,
    });
    return res.data.data;
};
