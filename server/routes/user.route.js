import express from "express";
import multer from "multer";

import {
  deleteUser,
  test,
  updateUser,
  getUserPhoto,
  getUserListings,
  getUser,
} from "../controllers/user.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get("/test", test);
router.get("/:id/photo", getUserPhoto);
router.post("/update/:id", verifyToken, upload.any(), updateUser);
router.delete("/delete/:id", verifyToken, deleteUser);
router.get("/listings/:id", verifyToken, getUserListings);
router.get("/:id", verifyToken, getUser);

export default router;
