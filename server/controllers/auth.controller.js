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
        message: "Username, email and password are required",
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
