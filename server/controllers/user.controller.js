import bcrypt from "bcryptjs";

import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";

// Test if the user route is working.
export const test = (req, res) => {
  // Send a simple message to the frontend.
  res.json({
    message: "User route is working fine!",
  });
};

// Update an existing user's information.
export const updateUser = async (req, res, next) => {
  // Check if the logged-in user is allowed to update this user.
  if (req.user.id !== req.params.id)
    return next(
      errorHandler(401, "You are not authorized to update this user!"),
    );

  try {
    // If the user wants to change their password, hash the new password first.
    if (req.body.password)
      req.body.password = bcrypt.hashSync(req.body.password, 10);

    // Find the user by ID and update their information.
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        // Take the new information from the request and update these fields in the user's MongoDB document
        $set: {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          photo: req.body.image,
        },
      },
      { new: true }, // Return the updated user.
    );

    if (!updatedUser) return next(errorHandler(404, "User not found"));

    // Remove the password before sending the user data to the frontend.
    const { password, ...rest } = updatedUser._doc;

    // Send the updated user without the password.
    res.status(200).json(rest);
  } catch (err) {
    // Send the error to the error-handling middleware.
    next(err);
  }
};
