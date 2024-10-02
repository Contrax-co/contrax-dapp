import { IProvider } from "@web3auth/base";
import { providerToSmartAccountSigner } from "permissionless";
import { useEffect, useState } from "react";
import { web3AuthInstance } from "src/config/walletConfig";
import { Account, Client, createWalletClient, custom, CustomTransport } from "viem";
import { arbitrum } from "viem/chains";

const useWeb3Auth = () => {
    const [connected, setConnected] = useState(false);
    const [client, setClient] = useState<Client<CustomTransport, typeof arbitrum, Account>>();
    const [isSocial, setIsSocial] = useState(false);
    const [web3AuthProvider, setWeb3AuthProvider] = useState<IProvider | null>(null);
    const connect = async () => {
        // Commented below two lines for web3auth rainbowkit integration
        // if (web3AuthInstance.status === "not_ready") await web3AuthInstance.initModal();
        // const _provider = await web3AuthInstance.connect();
        // commented cause we say no to aa accuont for the time being
        // const _isSocial = web3AuthInstance.connectedAdapterName === "openlogin";
        // AA- Account set to false
        const _isSocial = false;

        setIsSocial(_isSocial);
        // Only check for migration purpose in alchemy-aa
        // if (web3AuthInstance.connectedAdapterName !== "openlogin") {
        //     alert("Please use social login!");
        //     return;
        // }
        const smartAccountSigner = await providerToSmartAccountSigner(web3AuthInstance.provider as any);
        const client = createWalletClient({
            account: smartAccountSigner.address,
            transport: custom(web3AuthInstance.provider!),
            chain: arbitrum,
        });
        setConnected(true);
        setClient(client);
        setWeb3AuthProvider(web3AuthInstance.provider);
        return {
            client,
            isSocial: _isSocial,
            provider: web3AuthInstance.provider!,
            address: smartAccountSigner.address,
        };
    };

    const disconnect = async () => {
        // if (web3AuthInstance.status === "not_ready") await web3AuthInstance.initModal();
        await web3AuthInstance.logout();
        setConnected(false);
        setClient(undefined);
    };

    return { connect, disconnect, connected, isSocial, client };
};

export default useWeb3Auth;
