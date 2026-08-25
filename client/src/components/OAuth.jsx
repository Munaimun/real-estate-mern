import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { FcGoogle } from "react-icons/fc";

import { app } from "../firebase";
import { signInSuccess } from "../redux/user/userSlice";

const OAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      // Create Google as the sign-in provider.
      const provider = new GoogleAuthProvider();

      // Get the Firebase authentication service.
      const auth = getAuth(app);

      // Open the Google sign-in popup and wait for the user to sign in.
      const result = await signInWithPopup(auth, provider);

      // Send the Google user's information to our backend.
      const res = await fetch("/api/auth/google", {
        method: "POST", // Send the user data to the server.
        headers: {
          "Content-Type": "application/json", // Tell the server we are sending JSON.
        },
        body: JSON.stringify({
          // Send the user's Google email.
          email: result.user.email,

          // Send the user's Google display name.
          name: result.user.displayName,

          // Send the user's Google profile picture.
          photo: result.user.photoURL,
        }),
      });

      // Convert the server response into JSON.
      const data = await res.json();

      // Save the logged-in user data in Redux.
      dispatch(signInSuccess(data));
      navigate("/");
    } catch (err) {
      // Show an error if Google sign-in fails.
      console.log(err);
    }
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      type="button"
      className="flex items-center justify-center gap-3 w-full border border-gray-300 rounded-lg p-3 text-sm sm:text-base font-medium text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors duration-200"
    >
      <FcGoogle className="w-5 h-5 shrink-0" />
      <span>Continue with Google</span>
    </button>
  );
};

export default OAuth;
