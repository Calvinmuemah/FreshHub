// controllers/data.controller.js
import * as DataService from "../services/data.js";

export const sendData = async (req, res) => {
  try {
    const data = await DataService.createData(req.body);
    res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getLatestData = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const data = await DataService.fetchLatest(deviceId);

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getHistory = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const data = await DataService.fetchHistory(deviceId);

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const getAvgTempPerHour = async (req, res) => {
  try {
    const { deviceId } = req.params;

    const data = await DataService.getAvgTemperaturePerHour(deviceId);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};