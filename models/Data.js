// models/data.model.js
import pool from "../config/db.js";

export const insertData = async (data) => {
  const query = `
    INSERT INTO cold_storage_data 
    (device_id, temperature, humidity, voltage, current, insight, recommendation, spoilage_risk)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
  `;

  const values = [
    data.deviceId,
    data.temperature,
    data.humidity,
    data.voltage,
    data.current,
    data.insight,
    data.recommendation,
    data.spoilage_risk,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

export const getLatestData = async (deviceId) => {
  const query = `
    SELECT * FROM cold_storage_data
    WHERE device_id = $1
    ORDER BY created_at DESC
    LIMIT 1;
  `;

  const result = await pool.query(query, [deviceId]);
  return result.rows[0];
};

export const getHistory = async (deviceId) => {
  const query = `
    SELECT * FROM cold_storage_data
    WHERE device_id = $1
    ORDER BY created_at DESC
    LIMIT 100;
  `;

  const result = await pool.query(query, [deviceId]);
  return result.rows;
};

export const getRecentData = async (deviceId, limit = 10) => {
  const query = `
    SELECT temperature, humidity
    FROM cold_storage_data
    WHERE device_id = $1
    ORDER BY created_at DESC
    LIMIT $2;
  `;

  const result = await pool.query(query, [deviceId, limit]);
  return result.rows;
};

export const getAvgTempPerHour = async (deviceId) => {
  const query = `
    SELECT 
      DATE_TRUNC('hour', created_at) AS hour,
      AVG(temperature) AS avg_temp
    FROM cold_storage_data
    WHERE device_id = $1
    GROUP BY hour
    ORDER BY hour ASC;
  `;

  const result = await pool.query(query, [deviceId]);
  return result.rows;
};