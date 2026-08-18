import { createSlice } from "@reduxjs/toolkit";

// This is the initial data stored in the Redux user state.
const initialState = {
  // Stores the currently logged-in user's information. null means that no user is logged in yet.
  currentUser: null,
  error: null,
  loading: false,
};

// createSlice creates the Redux state, reducers, and actions for the user.
const userSlice = createSlice({
  name: "user", // Name of this Redux slice.
  initialState, // Set the initial values for the user state.

  // Reducers are functions that update the Redux state.
  reducers: {
    // Runs when the sign-in request starts.
    signInStart: (state) => {
      state.loading = true;
    },

    // Runs when the sign-in request is successful.
    signInSuccess: (state, action) => {
      // Store the user data received from the server.
      // action.payload contains the data sent with this action.
      state.currentUser = action.payload;
      state.loading = false;
      state.error = null; // Clear any previous error.
    },

    // Runs when the sign-in request fails.
    signInFailure: (state, action) => {
      // Store the error message received from the server.
      // action.payload contains the error message.
      state.error = action.payload;
      state.loading = false;
    },
  },
});

// Export these actions so components can use them with dispatch().
export const { signInStart, signInSuccess, signInFailure } = userSlice.actions;
export default userSlice.reducer; // Export the reducer to be used in the Redux store.
