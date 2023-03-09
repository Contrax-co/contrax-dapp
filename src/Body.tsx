import { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import Farms from "src/pages/Farms/Farms";
import Dashboard from "src/pages/Dashboard/Dashboard";
import Exchange from "./pages/Exchange/Exchange";
import Test from "./pages/Test/Test";
import usePriceOfTokens from "./hooks/usePriceOfTokens";
import { useFarmApys } from "./hooks/farms/useFarmApy";
import useBalances from "./hooks/useBalances";
import useFarmDetails from "./hooks/farms/useFarmDetails";

function Body() {
    const { reloadPrices } = usePriceOfTokens();
    const { reloadApys } = useFarmApys();
    const { reloadBalances } = useBalances();
    const { reloadFarmData } = useFarmDetails();

    useEffect(() => {
        reloadPrices();
        // after 5 min reload prices
        const interval = setInterval(() => {
            reloadPrices();
        }, 1000 * 60 * 5);
        return () => clearInterval(interval);
    }, [reloadPrices]);

    useEffect(() => {
        reloadApys();
        // after 5 min reload prices
        const interval = setInterval(() => {
            reloadApys();
        }, 1000 * 60 * 5);
        return () => clearInterval(interval);
    }, [reloadApys]);

    useEffect(() => {
        reloadBalances();
        // after 5 min reload prices
        const interval = setInterval(() => {
            reloadBalances();
        }, 1000 * 60 * 2);
        return () => clearInterval(interval);
    }, [reloadBalances]);

    useEffect(() => {
        reloadFarmData();
    }, [reloadFarmData]);

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
