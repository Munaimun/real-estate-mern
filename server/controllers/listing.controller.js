import Listing from "../models/listing.model.js";

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
