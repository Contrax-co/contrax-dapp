import React from "react";

// TODO: use this component
const WalletDisclaimer = ({ Link, Text }: any) => {
    return (
        <Text>
            By connecting your wallet, you agree to the <Link href="/termsofuse.pdf">Terms of Service</Link> and
            acknowledge you have read and understand them
        </Text>
    );
};

export default WalletDisclaimer;
