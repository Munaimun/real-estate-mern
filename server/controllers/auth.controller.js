import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";

// Register a new user
export const signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Validate the input fields
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Every field is required",
      });
    }

    // hash the password before saving it to the database
    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User created successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Login an existing user
export const signin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Check if the user exists
    const validUser = await User.findOne({ email });
    if (!validUser) return next(errorHandler(404, "User not found"));

    // Check if the password is valid
    const validPassword = bcrypt.compareSync(password, validUser.password);
    if (!validPassword) return next(errorHandler(401, "Invalid password"));

    // Generate a JWT token and send it in the response
    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);

    const { password: pass, ...rest } = validUser._doc; // Exclude the password from the response
    res
      .cookie("access_token", token, { httpOnly: true })
      .status(200)
      .json(rest); // Send the user data without the password
  } catch (err) {
    next(err);
  }
};

// Handle Google OAuth login
export const google = async (req, res, next) => {
  try {
    // Find a user with the email received from Google.
    const user = await User.findOne({ email: req.body.email });

    // If the user already exists, log them in.
    if (user) {
      if (req.body.photo && user.photo !== req.body.photo) {
        user.photo = req.body.photo;
        await user.save();
      }

      // Create a JWT token using the user's ID.
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

      // Remove the password before sending the user data to the frontend.
      const { password, ...rest } = user._doc;

      // Save the token in a cookie and send the user data.
      res
        .cookie("access_token", token, { httpOnly: true })
        .status(200)
        .json(rest);
    } else {
      // Generate a random password for the new Google user.
      const generatedPass = Math.random().toString(36).slice(-8);

      // Hash the generated password before saving it in the database.
      const hashedPassword = bcrypt.hashSync(generatedPass, 10);

      // Create a new user using the information received from Google.
      const newUser = new User({
        // Create a unique username from the user's Google name.
        username:
          req.body.name.split(" ").join("").toLowerCase() +
          Math.random().toString(36).slice(-3),

        // Save the user's Google email.
        email: req.body.email,

        // Save the hashed random password.
        password: hashedPassword,

        // Save the user's Google profile picture.
        photo: req.body.photo,
      });

      // Save the new user in MongoDB.
      await newUser.save();

      // Create a JWT token using the new user's ID.
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);

      // Remove the password before sending the new user's data.
      const { password, ...rest } = newUser._doc;

      // Save the token in a cookie and send the new user data.
      res
        .cookie("access_token", token, { httpOnly: true })
        .status(200)
        .json(rest);
    }
  } catch (err) {
    // Send any error to the error-handling middleware.
    next(err);
  }
};

export const signout = async (req, res, next) => {
  try {
    res.clearCookie("access_token");
    res.status(200).json({ message: "User signed out successfully" });
  } catch (err) {
    next(err);
  }
};
