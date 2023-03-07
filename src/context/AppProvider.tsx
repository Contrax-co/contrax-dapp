import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch, useAppSelector } from "src/state";
import { updatePrices } from "src/state/prices/pricesReducer";
import { toggleTheme } from "src/state/settings/settingsReducer";

export const AppContext = React.createContext({
    lightMode: true,
    toggleLight: () => {},
});

interface Props {
    children: React.ReactNode;
}

const AppProvider: React.FC<Props> = ({ children }) => {
    const theme = useAppSelector((state) => state.settings.theme);
    const dispatch = useAppDispatch();
    

    const toggleLight = () => {
        dispatch(toggleTheme());
    };

    const lightMode = useMemo(() => theme === "light", [theme]);
    
    React.useEffect(() => {
        document.documentElement.setAttribute("data-lightMode", `${lightMode}`);
    }, [lightMode]);

    // dispatch(updatePrices({
    //     chainId
    // }))

    return (
        <AppContext.Provider
            value={{
                lightMode,
                toggleLight,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};
export default AppProvider;
