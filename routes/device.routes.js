// routes/device.routes.js
import express from "express";
import {
  createDevice,
  getDevices,
} from "../controllers/device.controller.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.post("/", verifyToken, createDevice);
router.get("/", verifyToken, getDevices);

export default router;