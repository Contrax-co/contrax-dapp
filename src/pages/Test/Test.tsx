import React from "react";
import { getGmxApyArbitrum } from "src/api/getGmxApy";
import useWallet from "src/hooks/useWallet";

const Test = () => {
    const { provider, currentWallet } = useWallet();

    React.useEffect(() => {
        getGmxApyArbitrum(provider, currentWallet).then(console.log);
    }, [provider, currentWallet]);

    return <div>Test</div>;
};

export default Test;
