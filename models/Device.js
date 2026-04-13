// models/device.model.js
import pool from "../config/db.js";

export const createDevice = async (userId, name, location, deviceId) => {
  const query = `
    INSERT INTO devices (user_id, name, location, device_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;

  const values = [userId, name, location, deviceId];

  const result = await pool.query(query, values);
  return result.rows[0];
};

export const getUserDevices = async (userId) => {
  const result = await pool.query(
    `SELECT * FROM devices WHERE user_id = $1`,
    [userId]
  );
  return result.rows;
};

export const getDeviceByDeviceId = async (deviceId) => {
  const result = await pool.query(
    `SELECT * FROM devices WHERE device_id = $1`,
    [deviceId]
  );
  return result.rows[0];
};