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

const persistedPricesReducer = persistReducer(
    { key: "prices", version: 1, storage, blacklist: ["isFetched"] },
    pricesReducer
);

const persistedDecimalReducer = persistReducer({ key: "decimals", version: 1, storage }, decimalsReducer);
const persistedSettingsReducer = persistReducer(
    { key: "settings", version: 1, storage, whitelist: ["theme"] },
    settingsReducer
);

const rootReducer = combineReducers({
    settings: persistedSettingsReducer,
    prices: persistedPricesReducer,
    apys: apysReducer,
    farms: farmsReducer,
    balances: balancesReducer,
    decimals: persistedDecimalReducer,
    supply: supplyReducer,
});

// const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
    devTools: process.env.NODE_ENV !== "production",
    reducer: rootReducer,
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
