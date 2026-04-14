// routes/testRoutes.js - DEBUG ONLY
import express from "express";
import pool from "../config/db.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET: List all devices and latest data for current user
router.get("/devices-with-data", verifyToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const devicesRes = await pool.query(
      "SELECT * FROM devices WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );

    const devices = devicesRes.rows;

    if (devices.length === 0) {
      return res.json({ 
        message: "No devices found. Create one first.",
        devices: []
      });
    }

    const devicesWithData = await Promise.all(
      devices.map(async (device) => {
        const latestRes = await pool.query(
          "SELECT * FROM cold_storage_data WHERE device_id = $1 ORDER BY created_at DESC LIMIT 1",
          [device.device_id]
        );

        return {
          ...device,
          latest_data: latestRes.rows[0] || null,
        };
      })
    );

    res.json(devicesWithData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST: Add sample data for testing
router.post("/seed-data/:deviceId", async (req, res) => {
  try {
    const { deviceId } = req.params;

    // Verify device exists
    const deviceRes = await pool.query(
      "SELECT * FROM devices WHERE device_id = $1",
      [deviceId]
    );

    if (deviceRes.rows.length === 0) {
      return res.status(404).json({ error: `Device ${deviceId} not found` });
    }

    // Insert sample data
    const sampleData = {
      temperature: 4.5 + Math.random() * 2,
      humidity: 75 + Math.random() * 10,
      voltage: 12.0 - Math.random() * 0.5,
      current: 0.8 + Math.random() * 0.2,
      insight: "Temperature stable. Humidity optimal.",
      recommendation: "No action needed.",
      spoilage_risk: "LOW",
    };

    const result = await pool.query(
      `INSERT INTO cold_storage_data 
       (device_id, temperature, humidity, voltage, current, insight, recommendation, spoilage_risk)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        deviceId,
        sampleData.temperature,
        sampleData.humidity,
        sampleData.voltage,
        sampleData.current,
        sampleData.insight,
        sampleData.recommendation,
        sampleData.spoilage_risk,
      ]
    );

    res.status(201).json({
      message: "Sample data added",
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
