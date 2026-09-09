import express from "express";

import { createListing } from "../controllers/listing.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

//
router.post("/create", verifyToken, createListing);

router.get("/:id/image/:imageIndex", async (req, res, next) => {
  try {
    const listing = await (await import("../models/listing.model.js")).default
      .findById(req.params.id)
      .select("images");
    const image = listing?.images?.[Number(req.params.imageIndex)];
    if (!image) return res.sendStatus(404);
    res.type(image.contentType).send(image.data);
  } catch (error) {
    next(error);
  }
});

export default router;
