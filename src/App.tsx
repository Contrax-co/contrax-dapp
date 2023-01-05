import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Application from "./pages/Application";
import WalletProvider from "./context/WalletProvider";

function App() {
    return (
        <WalletProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Application />} />
                </Routes>
            </Router>
        </WalletProvider>
    );
}

export default App;
