import jwt from "jsonwebtoken";
import { errorHandler } from "./error.js";

// Check if the user has a valid login token.
export const verifyToken = (req, res, next) => {
  // Get the token from the access_token cookie.
  const token = req.cookies.access_token;

  // If there is no token, the user is not logged in.
  if (!token) return next(errorHandler(401, "You are not authenticated!"));

  // Check if the token is valid using our secret key.
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    // If the token is not valid, stop the request.
    if (err) return next(errorHandler(403, "Token is not valid!"));

    // Save the user information from the token in the request.
    req.user = user;

    // Continue to the next function or route.
    next();
  });
};
