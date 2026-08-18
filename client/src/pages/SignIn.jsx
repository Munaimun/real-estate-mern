import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  signInStart,
  signInSuccess,
  signInFailure,
} from "../redux/user/userSlice.js";

const SignIn = () => {
  const [formtData, setFormData] = useState({});
  const { loading, err } = useSelector((state) => state.user); // Get the loading and error state from Redux.

  const navigate = useNavigate();

  const dispatch = useDispatch();

  // Updates form data when an input changes.
  const handleChange = (e) => {
    setFormData({
      ...formtData, // Keep all the existing values in formData. Without this, changing one input would remove the other values.
      [e.target.id]: e.target.value, // Use the input's id as the property name (e.g., username: "fahad").
    });
  };

  // Handles form submission.
  const handleSubmit = async (e) => {
    e.preventDefault(); // to prevent the page from refreshing

    try {
      dispatch(signInStart()); // Start the sign-in process.

      // Send the form data to the signin API.
      const res = await fetch("/api/auth/signin", {
        method: "POST", // Send data to the server.
        headers: {
          "Content-Type": "application/json", // Tell the server we're sending JSON.
        },
        body: JSON.stringify(formtData), // Convert formData into JSON before sending.
      });

      const data = await res.json(); // Convert the response from the server into JSON.

      if (data.success === false) {
        dispatch(signInFailure(data.message)); // If the server says signin failed, dispatch the failure action with the error message.
        return;
      }

      dispatch(signInSuccess(data)); // If signin is successful, dispatch the success action with the user data.
      navigate("/"); // Redirect the user to the home page after successful signin.
    } catch (err) {
      dispatch(signInFailure(err.message)); // If there's a network error or other issue, dispatch the failure action with a generic error message.
    }
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl text-center font-semibold my-7">Sign In</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="email"
          className="border p-3 rounded-lg"
          id="email"
          onChange={handleChange}
        />
        <input
          type="password"
          placeholder="password"
          className="border p-3 rounded-lg"
          id="password"
          onChange={handleChange}
        />
        <button
          disabled={loading}
          className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
        >
          {loading ? "Loading..." : "Sign In"}
        </button>
      </form>

      <div className="flex gap-2 mt-5">
        <p>{`Don't have an account?`}</p>
        <Link to={"/sign-up"}>
          <span className="text-blue-700">Sign up</span>
        </Link>
      </div>
      {err && <p className="text-red-500 mt-5">{err}</p>}
    </div>
  );
};

export default SignIn;
