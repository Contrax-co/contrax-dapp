import React from "react";
import { getGmxApyArbitrum } from "src/api/getGmxApy";
import useWallet from "src/hooks/useWallet";
import { notify } from "reapop";

const Test = () => {
    const { provider, currentWallet } = useWallet();

    React.useEffect(() => {
        getGmxApyArbitrum(provider, currentWallet).then(console.log);
    }, [provider, currentWallet]);
    const fn = () => {
        notify({
            message: "Test",
        });
    };
    return (
        <div onClick={fn} style={{ color: "red" }}>
            Test
        </div>
    );
};

export default Test;
