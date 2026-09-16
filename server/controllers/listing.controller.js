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

// Update an existing listing.
export const updateListing = async (req, res, next) => {
  try {
    // Find the listing using the ID from the URL.
    const listing = await Listing.findById(req.params.id);

    // If the listing does not exist, send a 404 error.
    if (!listing)
      return res
        .status(404)
        .json({ success: false, message: "Listing not found!" });

    // Check if the logged-in user owns this listing.
    // req.user.id comes from the logged-in user's JWT token.
    // listing.userRef is the ID of the user who created the listing, which is stored in the database.
    if (req.user.id !== listing.userRef)
      return next(
        errorHandler(403, "You are not authorized to update this listing"),
      );

    // Copy all the data sent from the frontend into a new object, this prevents us from directly changing req.body.
    const updateData = { ...req.body };

    // These fields should be stored as numbers in MongoDB.
    const numericFields = [
      "regularPrice",
      "discountPrice",
      "bathrooms",
      "bedrooms",
    ];

    // These fields should be stored as true or false.
    const booleanFields = ["furnished", "parking", "offer"];

    // Convert numeric fields from strings to numbers.
    // FormData sends values as strings.
    for (const field of numericFields) {
      // Check if the field exists in the updateData object.
      if (field in updateData) {
        updateData[field] = Number(updateData[field]);
      }
    }

    // Convert boolean fields from strings to actual booleans.
    // For example, "true" becomes true and "false" becomes false.
    for (const field of booleanFields) {
      if (field in updateData) {
        updateData[field] = updateData[field] === "true";
      }
    }

    // If the user uploaded new images,
    // replace the old images with the new ones.
    if (req.files?.length) {
      updateData.images = req.files.map((file) => ({
        // Store the actual image data.
        data: file.buffer,

        // Store the image's file type, such as image/jpeg.
        contentType: file.mimetype,
      }));
    }

    // Find the listing by ID and update it with the new data.
    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,

      // Send the updated fields to MongoDB.
      updateData,

      {
        // Return the updated listing instead of the old listing.
        returnDocument: "after",
        // Run the schema validation before saving the update.
        runValidators: true,
      },
    );

    // Send the updated listing back to the frontend.
    res.status(200).json(updatedListing);
  } catch (err) {
    // If something goes wrong, pass the error to Express error handling.
    next(err);
  }
};

// This function fetches a specific listing from MongoDB using its ID.
export const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) return next(errorHandler(404, "Listing not found"));

    const listingData = listing.toObject();
    listingData.images = listing.images.map(
      (_, imageIndex) => `/api/listing/${listing._id}/image/${imageIndex}`,
    );

    res.status(200).json(listingData);
  } catch (err) {
    next(err);
  }
};
