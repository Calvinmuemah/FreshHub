// controllers/device.controller.js
import * as DeviceService from "../services/device.service.js";

export const createDevice = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { name, location } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!name) {
      return res.status(400).json({ error: "name is required" });
    }

    const device = await DeviceService.createNewDevice(
      userId,
      name,
      location
    );

    res.status(201).json({
      success: true,
      device,
    });
  } catch (error) {
    const statusCode = error.status || 500;
    res.status(statusCode).json({ error: error.message || "Unexpected server error" });
  }
};

export const getDevices = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const devices = await DeviceService.fetchUserDevices(userId);
    res.json(devices);
  } catch (error) {
    const statusCode = error.status || 500;
    res.status(statusCode).json({ error: error.message || "Unexpected server error" });
  }
};