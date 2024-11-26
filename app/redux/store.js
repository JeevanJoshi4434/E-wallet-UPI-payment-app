// redux/store.js
"use client";
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import authReducer from './authSlice';

// Persist configuration
const persistConfig = {
    key: 'root',
    storage,
};

// Wrap the auth reducer with persist
const persistedReducer = persistReducer(persistConfig, authReducer);

// Configure store with persisted reducer and middleware
export const store = configureStore({
    reducer: {
        auth: persistedReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER], // Ignore persist actions
            },
        }),
});

// Create the persistor
export const persistor = persistStore(store);
