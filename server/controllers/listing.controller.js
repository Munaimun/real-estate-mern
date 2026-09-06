import Listing from "../models/listing.model.js";

// This function creates a new listing and saves it to MongoDB.
export const createListing = async (req, res, next) => {
  try {
    // req.body contains the listing data sent from the frontend.
    // Listing.create() creates a new document and saves it to MongoDB.
    const listing = await Listing.create(req.body);

    // Send the newly created listing back to the frontend.
    return res.status(201).json(listing);
  } catch (err) {
    // If something goes wrong, send the error to the error-handling middleware.
    next(err);
  }
};
