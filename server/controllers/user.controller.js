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
    return next(errorHandler(401, "You are not authorized!"));

  try {
    const updates = {};
    if (typeof req.body.username === "string" && req.body.username.trim())
      updates.username = req.body.username.trim();
    if (typeof req.body.email === "string" && req.body.email.trim())
      updates.email = req.body.email.trim();
    if (typeof req.body.photo === "string" && req.body.photo.trim())
      updates.photo = req.body.photo.trim();
    if (typeof req.body.password === "string" && req.body.password.trim())
      updates.password = bcrypt.hashSync(req.body.password, 10);

    if (!Object.keys(updates).length)
      return next(errorHandler(400, "No profile changes were provided"));

    // Find the user by ID and update their information.
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }, // Return the updated user and validate changes.
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

// Delete a user account.
export const deleteUser = async (req, res, next) => {
  // if the logged-in user is not the same as the user to be deleted, return an error.
  if (req.user.id !== req.params.id)
    return next(
      errorHandler(401, "You are not authorized to delete this account!"),
    );

  try {
    await User.findByIdAndDelete(req.params.id); // Delete the user from the database.
    res
      .status(200)
      .json({ message: "User account deleted successfully." })
      .clearCookie("access_token"); // Clear the access token cookie after deleting the user account.
  } catch (err) {
    next(err);
  }
};
