// controllers/device.controller.js
import * as DeviceService from "../services/device.service.js";

export const createDevice = async (req, res) => {
  try {
    const userId = req.body.userId || req.user?.id;
    const { name, location } = req.body;

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
    res.status(500).json({ error: error.message });
  }
};

export const getDevices = async (req, res) => {
  try {
    const userId = req.query.userId || req.user?.id;

    if (!userId) {
      return res.status(400).json({ error: "userId query param is required" });
    }

    const devices = await DeviceService.fetchUserDevices(userId);
    res.json(devices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};