import "./App.css";
import AppProvider from "src/context/AppProvider";
import Body from "./Body";

// force build
function App() {
    return (
        <AppProvider>
            <Body />
        </AppProvider>
    );
}

export default App;
