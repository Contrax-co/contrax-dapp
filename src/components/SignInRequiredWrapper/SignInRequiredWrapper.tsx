import useWallet from "src/hooks/useWallet";
import { NotSignedIn } from "../NotSignedIn/NotSignedIn";

export const SignInRequiredWrapper = ({ children }: { children: JSX.Element }) => {
    const { currentWallet } = useWallet();
    return currentWallet ? children : <NotSignedIn />;
};
