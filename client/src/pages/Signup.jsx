import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const SignUp = () => {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Updates form data when an input changes.
  const handleChange = (e) => {
    setFormData({
      ...formData, // Keep all the existing values in formData. Without this, changing one input would remove the other values.
      [e.target.id]: e.target.value, // Use the input's id as the property name (e.g., username: "fahad").
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // to prevent the page from refreshing

    try {
      setLoading(true); // Set loading to true when the form is submitted.

      // Send the form data to the signup API.
      const res = await fetch("/api/auth/signup", {
        method: "POST", // Send data to the server.
        headers: {
          "Content-Type": "application/json", // Tell the server we're sending JSON.
        },
        body: JSON.stringify(formData), // Convert formData into JSON before sending.
      });

      const data = await res.json(); // Convert the response from the server into JSON.

      if (data.success === false) {
        setLoading(false); // Set loading to false since the request is complete.
        setError(data.message); // If the signup failed, set the error message.
        return;
      }

      setLoading(false); // Set loading to false since the request is complete.
      setError(null); // Clear any previous errors.
      navigate("/sign-in"); // Redirect the user to the sign-in page after successful signup.
    } catch (err) {
      setLoading(false); // Set loading to false since the request is complete.
      setError(err.message);
    }
  };

  // console.log(formData);

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl text-center font-semibold my-7">Sign Up</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="username"
          className="border p-3 rounded-lg"
          id="username"
          onChange={handleChange}
        />
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
          {loading ? "Loading..." : "Sign Up"}
        </button>
      </form>

      <div className="flex gap-2 mt-5">
        <p>Have an account?</p>
        <Link to={"/sign-in"}>
          <span className="text-blue-700">Sign in</span>
        </Link>
      </div>
      {error && <p className="text-red-500 mt-5">{error}</p>}
    </div>
  );
};

export default SignUp;
