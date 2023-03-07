import { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import Farms from "src/pages/Farms/Farms";
import Dashboard from "src/pages/Dashboard/Dashboard";
import Exchange from "./pages/Exchange/Exchange";
import Test from "./pages/Test/Test";
import { useAppDispatch, useAppSelector } from "./state";
import { updatePrices } from "./state/prices/pricesReducer";
import useFarms from "./hooks/farms/useFarms";
import useWallet from "./hooks/useWallet";
import usePriceOfTokens from "./hooks/usePriceOfTokens";

function Body() {
    const { reloadPrices } = usePriceOfTokens();

    useEffect(() => {
        reloadPrices();
        const interval = setInterval(() => {
            reloadPrices();
        }, 1000 * 60 * 5);
        return () => clearInterval(interval);
    }, [reloadPrices]);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />}>
                    <Route path="" element={<Dashboard />} />
                    <Route path="/farms" element={<Farms />} />
                    <Route path="/exchange" element={<Exchange />} />
                    <Route path="test" element={<Test />} />
                    <Route path="*" element={<h3 style={{ color: "white" }}>Not Found</h3>} />
                </Route>
            </Routes>
        </Router>
    );
}

export default Body;
