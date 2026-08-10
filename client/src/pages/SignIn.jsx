import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const SignIn = () => {
  const [formtData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

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
      setLoading(true); // Set loading to true when the form is submitted.

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
        setLoading(false); // Set loading to false since the request is complete.
        setError(data.message); // If the signin failed, set the error message.
        return;
      }

      setLoading(false); // Set loading to false since the request is complete.
      setError(null);
      navigate("/"); // Redirect the user to the home page after successful signin.
    } catch (err) {
      setLoading(false); // Set loading to false since the request is complete.
      setError(err.message);
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
      {error && <p className="text-red-500 mt-5">{error}</p>}
    </div>
  );
};

export default SignIn;
