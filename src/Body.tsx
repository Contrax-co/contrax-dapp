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

function Body() {
    const { farms } = useFarms();
    const dispatch = useAppDispatch();
    const prices = useAppSelector((state) => state.prices.prices);
    const { networkId } = useWallet();

    console.log("prices", prices);

    useEffect(() => {
        dispatch(updatePrices({ farms, chainId: networkId }));
    }, [farms, networkId]);
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
