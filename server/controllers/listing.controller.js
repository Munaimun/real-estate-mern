import Listing from "../models/listing.model.js";
import { errorHandler } from "../utils/error.js";

// This function creates a new listing and saves it to MongoDB.
export const createListing = async (req, res, next) => {
  try {
    const images = (req.files || []).map((file) => ({
      data: file.buffer,
      contentType: file.mimetype,
    }));

    if (!images.length || images.length > 6)
      return res
        .status(400)
        .json({ success: false, message: "Choose between 1 and 6 images" });

    // Create the listing in MongoDB
    const listing = await Listing.create({
      ...req.body,
      regularPrice: Number(req.body.regularPrice),
      discountPrice: Number(req.body.discountPrice),
      bathrooms: Number(req.body.bathrooms),
      bedrooms: Number(req.body.bedrooms),
      furnished: req.body.furnished === "true",
      parking: req.body.parking === "true",
      offer: req.body.offer === "true",
      images,
      userRef: req.user.id,
    });

    // Send the newly created listing back to the frontend.
    return res.status(201).json(listing);
  } catch (err) {
    // If something goes wrong, send the error to the error-handling middleware.
    next(err);
  }
};

// This function deletes a listing from MongoDB.
export const deleteListing = async (req, res, next) => {
  try {
    // Find the listing using the ID from the URL.
    const listing = await Listing.findById(req.params.id);

    // If no listing was found, send a 404 error.
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    // Check if the logged-in user owns this listing.
    // req.user.id comes from the JWT token.
    // listing.userRef is the user who created the listing, which is stored in the database.
    if (req.user.id !== listing.userRef) {
      return next(
        errorHandler(403, "You are not authorized to delete this listing"),
      );
    }

    // Delete the listing from MongoDB.
    await Listing.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Listing deleted successfully",
    });
  } catch (err) {
    // Pass any database/server error to the error handler.
    next(err);
  }
};

// This function updates a listing in MongoDB.
export const updateListing = async (req, res, next) => {
  try {
    // Find the listing using the ID in the URL.
    const listing = await Listing.findById(req.params.id);

    if (!listing)
      return res
        .status(404)
        .json({ success: false, message: "Listing not found!" });

    // Check that the logged-in user owns this listing.
    if (req.user.id !== listing.userRef)
      return next(
        errorHandler(403, "You are not authorized to update this listing"),
      );

    const updateData = { ...req.body };
    const numericFields = [
      "regularPrice",
      "discountPrice",
      "bathrooms",
      "bedrooms",
    ];
    const booleanFields = ["furnished", "parking", "offer"];

    for (const field of numericFields) {
      if (field in updateData) updateData[field] = Number(updateData[field]);
    }

    for (const field of booleanFields) {
      if (field in updateData) updateData[field] = updateData[field] === "true";
    }

    // Replace the stored images only when new files were uploaded.
    if (req.files?.length) {
      updateData.images = req.files.map((file) => ({
        data: file.buffer,
        contentType: file.mimetype,
      }));
    }

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true },
    );

    res.status(200).json(updatedListing);
  } catch (err) {
    next(err);
  }
};
