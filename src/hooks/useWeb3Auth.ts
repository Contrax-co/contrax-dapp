import { providerToSmartAccountSigner } from "permissionless";
import { useEffect, useState } from "react";
import { web3AuthInstance } from "src/config/walletConfig";
import { createWalletClient, custom } from "viem";
import { arbitrum } from "viem/chains";

const useWeb3Auth = () => {
    const [connected, setConnected] = useState(false);
    const connect = async () => {
        if (web3AuthInstance.status === "not_ready") await web3AuthInstance.initModal();
        const _provider = await web3AuthInstance.connect();
        if (web3AuthInstance.connectedAdapterName !== "openlogin") {
            alert("Please use social login!");
            return;
        }
        const smartAccountSigner = await providerToSmartAccountSigner(web3AuthInstance.provider as any);
        const client = createWalletClient({
            account: smartAccountSigner.address,
            transport: custom(web3AuthInstance.provider!),
            chain: arbitrum,
        });
        setConnected(true);
        return client;
    };

    const disconnect = async () => {
        if (web3AuthInstance.status === "not_ready") await web3AuthInstance.initModal();
        await web3AuthInstance.logout();
        setConnected(false);
    };

    useEffect(() => {
        (async function () {
            if (web3AuthInstance.status === "not_ready") {
                await web3AuthInstance.initModal();
                // @ts-ignore
                if (web3AuthInstance.status === "connected") setConnected(true);
            }
        })();
    }, []);

    return { connect, disconnect, connected };
};

export default useWeb3Auth;
