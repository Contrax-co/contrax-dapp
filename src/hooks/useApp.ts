import { useContext } from "react";
import { AppContext } from "src/context/AppProvider";

const useApp = () => {
    return useContext(AppContext);
};

export default useApp;
