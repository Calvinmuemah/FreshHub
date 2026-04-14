import * as DeviceService from "../services/device.service.js";

// CREATE DEVICE (no auth)
export const createDevice = async (req, res) => {
  try {
    const { userId, name, location } = req.body;

    // validate
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
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
    res.status(statusCode).json({
      error: error.message || "Unexpected server error",
    });
  }
};

// GET DEVICES (no auth)
export const getDevices = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const devices = await DeviceService.fetchUserDevices(userId);

    res.json({
      success: true,
      devices,
    });
  } catch (error) {
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      error: error.message || "Unexpected server error",
    });
  }
};