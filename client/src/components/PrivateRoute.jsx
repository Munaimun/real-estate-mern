import { useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";

// This component protects private pages from users who are not logged in.
const PrivateRoute = () => {
  // Get the current logged-in user from the Redux store.
  const { currentUser } = useSelector((state) => state.user);

  // If a user is logged in, show the requested private page.
  // If no user is logged in, redirect them to the sign-in page.
  return currentUser ? <Outlet /> : <Navigate to="/sign-in" />;
};

export default PrivateRoute;
