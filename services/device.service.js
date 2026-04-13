// services/device.service.js
import * as DeviceModel from "../models/Device.js";
import { generateDeviceId } from "../utils/deviceId.util.js";

export const createNewDevice = async (userId, name, location) => {
  const deviceId = generateDeviceId();

  return await DeviceModel.createDevice(
    userId,
    name,
    location,
    deviceId
  );
};

export const fetchUserDevices = async (userId) => {
  return await DeviceModel.getUserDevices(userId);
};