import React from "react";
import { RainbowKitProvider, DisclaimerComponent } from "@rainbow-me/rainbowkit";

const WalletDisclaimer: DisclaimerComponent = ({ Link, Text }) => {
    return (
        <Text>
            By connecting your wallet, you agree to the <Link href="/termsofuse.pdf">Terms of Service</Link> and
            acknowledge you have read and understand them
        </Text>
    );
};

export default WalletDisclaimer;
