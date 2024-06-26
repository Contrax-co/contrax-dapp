import { providerToSmartAccountSigner } from "permissionless";
import { web3AuthInstance } from "src/config/walletConfig";
import { createWalletClient, custom } from "viem";
import { arbitrum } from "viem/chains";

const useWeb3Auth = () => {
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
        return client;
    };

    const disconnect = () => {
        web3AuthInstance.logout();
    };

    return { connect, disconnect };
};

export default useWeb3Auth;
