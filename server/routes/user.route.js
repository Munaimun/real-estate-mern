import express from "express";

import {
  deleteUser,
  test,
  updateUser,
  getUserPhoto,
} from "../controllers/user.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.get("/test", test);
router.get("/:id/photo", getUserPhoto);
router.post("/update/:id", verifyToken, updateUser);
router.delete("/delete/:id", verifyToken, deleteUser);

export default router;
