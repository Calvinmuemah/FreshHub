import express from "express";
import {
  sendData,
  getLatestData,
  getHistory,
  getAvgTempPerHour,
} from "../controllers/dataController.js";

const router = express.Router();

router.post("/send", sendData);
router.get("/:deviceId/latest", getLatestData);
router.get("/:deviceId/history", getHistory);

router.get("/:deviceId/avg-temp-hour", getAvgTempPerHour);

export default router;