import express from "express";
import multer from "multer";

import { createListing } from "../controllers/listing.controller.js";

import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

// Store uploaded files in memory temporarily.
// The controller will get the files through req.files.
const upload = multer({
  storage: multer.memoryStorage(),
});

// This route creates a new listing.
// verifyToken runs first to make sure the user is logged in.
// If the user is authenticated, createListing handles the request.
router.post("/create", verifyToken, upload.array("images", 6), createListing);

// This route gets a specific image from a listing.
// :id = the listing's MongoDB ID
// :imageIndex = which image we want from the listing's images array
router.get("/:id/image/:imageIndex", async (req, res, next) => {
  try {
    // Import the Listing model and find the listing using the ID from the URL.
    // .select("images") means we only need the images field from the database.
    const listing = await (await import("../models/listing.model.js")).default
      .findById(req.params.id)
      .select("images");

    // Get the requested image from the images array.
    // Number() converts imageIndex from a string to a number.
    const image = listing?.images?.[Number(req.params.imageIndex)];

    // If the listing or image doesn't exist, return a 404 error.
    if (!image) return res.sendStatus(404);

    // Tell the browser what type of image it is.
    // Then send the actual image data to the browser.
    res.type(image.contentType).send(image.data);
  } catch (error) {
    // If something goes wrong, pass the error to Express error handling.
    next(error);
  }
});

export default router;
