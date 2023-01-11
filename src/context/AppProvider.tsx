import React from "react";

export const AppContext = React.createContext({
    lightMode: false,
    toggleLight: () => {},
});

interface Props {
    children: React.ReactNode;
}

const AppProvider: React.FC<Props> = ({ children }) => {
    const [lightMode, setLightMode] = React.useState(() => {
        const data = window.sessionStorage.getItem("lightMode");
        if (data != null) {
            return JSON.parse(data);
        } else {
            return false;
        }
    });

    const toggleLight = () => {
        setLightMode(!lightMode);
    };

    React.useEffect(() => {
        window.sessionStorage.setItem("lightMode", JSON.stringify(lightMode));
    }, [lightMode]);

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
