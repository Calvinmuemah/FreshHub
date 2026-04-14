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
    
    if (!deviceId) {
      return res.status(400).json({ error: "deviceId is required" });
    }

    console.log("Fetching latest data for deviceId:", deviceId);
    const data = await DataService.fetchLatest(deviceId);
    console.log("Latest data result:", data);

    res.status(200).json({
      success: true,
      data: data || null,
    });
  } catch (error) {
    console.error("Error in getLatestData:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getHistory = async (req, res) => {
  try {
    const { deviceId } = req.params;
    
    if (!deviceId) {
      return res.status(400).json({ error: "deviceId is required" });
    }

    console.log("Fetching history for deviceId:", deviceId);
    const data = await DataService.fetchHistory(deviceId);
    console.log("History data result:", data);

    res.status(200).json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error("Error in getHistory:", error);
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