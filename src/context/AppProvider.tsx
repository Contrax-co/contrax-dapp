import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch, useAppSelector } from "src/state";
import { updatePrices } from "src/state/prices/pricesReducer";
import { toggleTheme, toggleSupportChat as _toggleSupportChat } from "src/state/settings/settingsReducer";

export const AppContext = React.createContext({
    lightMode: true,
    supportChat: true,
    toggleLight: () => {},
    toggleSupportChat: () => {},
});

interface Props {
    children: React.ReactNode;
}

const AppProvider: React.FC<Props> = ({ children }) => {
    const theme = useAppSelector((state) => state.settings.theme);
    const supportChat = useAppSelector((state) => state.settings.supportChat);
    const dispatch = useAppDispatch();

    const toggleLight = () => {
        dispatch(toggleTheme());
    };
    const toggleSupportChat = () => {
        dispatch(_toggleSupportChat());
    };

    const lightMode = useMemo(() => theme === "light", [theme]);

    React.useEffect(() => {
        document.documentElement.setAttribute("data-lightMode", `${lightMode}`);
    }, [lightMode]);

    return (
        <AppContext.Provider
            value={{
                lightMode,
                supportChat,
                toggleLight,
                toggleSupportChat,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};
export default AppProvider;
