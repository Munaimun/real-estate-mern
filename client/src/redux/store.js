import { configureStore } from "@reduxjs/toolkit";

import userReducer from "./user/userSlice";

export const store = configureStore({
  reducer: {
    user: userReducer, // Add the user reducer to the Redux store.
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});
