// services/data.service.js
import * as DataModel from "../models/Data.js";
import * as DeviceModel from "../models/Device.js";
import { checkAlerts } from "../utils/alerts.js";
import { getAIInsights } from "./ai.service.js";
import { predictSpoilage } from "./prediction.service.js";
import pool from "../config/db.js";

export const createData = async (payload) => {
  try {
    const { deviceId, temperature, humidity, voltage, current } = payload;

    // ✅ 1. Validate required fields
    if (!deviceId) {
      throw new Error("deviceId is required");
    }

    if (
      temperature === undefined ||
      humidity === undefined ||
      voltage === undefined ||
      current === undefined
    ) {
      throw new Error("Missing sensor values");
    }

    // ✅ 2. Validate device exists
    const device = await DeviceModel.getDeviceByDeviceId(deviceId);
    if (!device) {
      throw new Error("Invalid deviceId");
    }

    // ✅ 3. Validate sensor values
    if (
      temperature < -50 || temperature > 100 ||
      humidity < 0 || humidity > 100 ||
      voltage < 0 || voltage > 20 ||
      current < 0 || current > 10000
    ) {
      throw new Error("Invalid sensor values");
    }

    // ✅ 4. Get user (for alerts)
    const userRes = await pool.query(
      "SELECT id, email, phone_number FROM system_users WHERE id = $1",
      [device.user_id]
    );

    const user = userRes.rows[0];

    // 🤖 5. AI Insights (SAFE)
    let aiResult = {
      insight: "No insight",
      recommendation: "No recommendation",
    };

    try {
      aiResult = await getAIInsights({
        temperature,
        humidity,
        voltage,
        current,
      });
    } catch (err) {
      console.error("AI error:", err.message);
    }

    // 🧠 6. Spoilage Prediction (SAFE)
    let spoilage = {
      risk: "UNKNOWN",
    };

    try {
      spoilage = await predictSpoilage(deviceId, {
        temperature,
        humidity,
      });
    } catch (err) {
      console.error("Prediction error:", err.message);
    }

    // 🚨 7. Alerts (WITH SPOILAGE)
    try {
      await checkAlerts(
        {
          temperature,
          humidity,
          voltage,
          current,
          spoilageRisk: spoilage.risk,
        },
        user
      );
    } catch (err) {
      console.error("Alert error:", err.message);
    }

    // 💾 8. Save data WITH AI + prediction
    const saved = await DataModel.insertData({
      deviceId,
      temperature,
      humidity,
      voltage,
      current,
      insight: aiResult?.insight || "No insight",
      recommendation: aiResult?.recommendation || "No recommendation",
      spoilage_risk: spoilage?.risk || "UNKNOWN",
    });

    return saved;

  } catch (error) {
    throw error;
  }
};

export const fetchLatest = async (deviceId) => {
  if (!deviceId) throw new Error("deviceId required");
  console.log("Service: fetchLatest called with deviceId:", deviceId);
  return await DataModel.getLatestData(deviceId);
};

export const fetchHistory = async (deviceId) => {
  if (!deviceId) throw new Error("deviceId required");
  console.log("Service: fetchHistory called with deviceId:", deviceId);
  return await DataModel.getHistory(deviceId);
};

export const getAvgTemperaturePerHour = async (deviceId) => {
  if (!deviceId) throw new Error("deviceId required");

  const data = await DataModel.getAvgTempPerHour(deviceId);

  // ✅ Format for frontend charts
  return data.map((row) => ({
    time: row.hour,
    temperature: parseFloat(row.avg_temp),
  }));
};