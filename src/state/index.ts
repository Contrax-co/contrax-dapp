import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import storage from "redux-persist/lib/storage";
import apysReducer from "./apys/apysReducer";
import balancesReducer from "./balances/balancesReducer";
import pricesReducer from "./prices/pricesReducer";
import settingsReducer from "./settings/settingsReducer";
import farmsReducer from "./farms/farmsReducer";
import supplyReducer from "./supply/supplyReducer";
import decimalsReducer from "./decimals/decimalsReducer";
import errorReducer from "./error/errorReducer";
import internetReducer from "./internet/internetReducer";
import rampReducer from "./ramp/rampReducer";
import accountReducer from "./account/accountReducer";
import feesReducer from "./fees/feesReducer";
import { getPersistConfig } from "redux-deep-persist";
import transactionsReducer from "./transactions/transactionsReducer";

const rootReducer = combineReducers({
    account: accountReducer,
    settings: settingsReducer,
    internet: internetReducer,
    error: errorReducer,
    prices: pricesReducer,
    apys: apysReducer,
    farms: farmsReducer,
    balances: balancesReducer,
    decimals: decimalsReducer,
    supply: supplyReducer,
    ramp: rampReducer,
    fees: feesReducer,
    transactions: transactionsReducer,
});

const persistConfig = getPersistConfig({
    key: "root",
    storage,
    version: 6,
    whitelist: [
        "prices.prices",
        "decimals.decimals",
        "settings.theme",
        "settings.showTokenDetailedBalances",
        "settings.supportChat",
        "account.earnTraxTermsAgreed",
        "account.referrerCode",
        "ramp.bridgeStates.USDC_POLYGON_TO_ARBITRUM_USDC.socketSourceTxHash",
        "ramp.bridgeStates.ETH_POLYGON_TO_ARBITRUM_ETH.socketSourceTxHash",
    ],
    rootReducer, // your root reducer must be also passed here
});

export const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
    // devTools: process.env.NODE_ENV !== "production",
    devTools: true,
    reducer: persistedReducer,
    middleware(getDefaultMiddleware) {
        return getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        });
    },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;

export const persistor = persistStore(store);
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>(); // Export a hook that can be reused to resolve types
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
