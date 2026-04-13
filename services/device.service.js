// services/device.service.js
import * as DeviceModel from "../models/Device.js";
import { findUserById } from "../models/users.js";
import { generateDeviceId } from "../utils/deviceId.util.js";

const toValidUserId = (rawUserId) => {
  const userId = Number(rawUserId);

  if (!Number.isInteger(userId) || userId <= 0) {
    const error = new Error("userId must be a positive integer");
    error.status = 400;
    throw error;
  }

  return userId;
};

const ensureUserExists = async (userId) => {
  try {
    const user = await findUserById(userId);
    if (!user) {
      const error = new Error(`User with id ${userId} does not exist`);
      error.status = 400;
      throw error;
    }
  } catch (error) {
    if (error.status) {
      throw error;
    }

    const wrapped = new Error("Database unavailable while validating userId");
    wrapped.status = 503;
    throw wrapped;
  }
};

export const createNewDevice = async (userId, name, location) => {
  const normalizedUserId = toValidUserId(userId);
  await ensureUserExists(normalizedUserId);

  const deviceId = generateDeviceId();

  try {
    return await DeviceModel.createDevice(
      normalizedUserId,
      name,
      location,
      deviceId
    );
  } catch (error) {
    if (error?.code === "23503") {
      const wrapped = new Error(`User with id ${normalizedUserId} does not exist`);
      wrapped.status = 400;
      throw wrapped;
    }

    const wrapped = new Error(error?.message || "Failed to create device");
    wrapped.status = error?.status || 500;
    throw wrapped;
  }
};

export const fetchUserDevices = async (userId) => {
  const normalizedUserId = toValidUserId(userId);
  await ensureUserExists(normalizedUserId);

  return await DeviceModel.getUserDevices(normalizedUserId);
};