import { combineReducers, configureStore } from "@reduxjs/toolkit";

import { persistReducer, persistStore } from "redux-persist";

import userReducer from "./user/userSlice";

const storage = {
  getItem: (key) => Promise.resolve(localStorage.getItem(key)),
  setItem: (key, value) => {
    localStorage.setItem(key, value);
    return Promise.resolve();
  },
  removeItem: (key) => {
    localStorage.removeItem(key);
    return Promise.resolve();
  },
};

// Combine all reducers into one main reducer.
const rootReducer = combineReducers({
  user: userReducer,
});

// Tell Redux Persist how to save the Redux state.
const persistConfig = {
  key: "root", // Name used to store the saved Redux state.
  storage, // Save the state in the browser's localStorage.
  version: 1, // Version of the saved state.
};

// Add persistence to the root reducer.
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create the Redux store.
export const store = configureStore({
  // Use the persisted reducer so Redux state can be saved and restored.
  reducer: persistedReducer,

  // Use Redux Toolkit's default middleware.
  // Turn off the serializable value check because of Redux Persist.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store); // Create a persistor to manage saving and restoring the Redux state.
