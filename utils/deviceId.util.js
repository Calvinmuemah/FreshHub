// utils/deviceId.util.js
export const generateDeviceId = () => {
  return "BARIDI-" + Math.random().toString(36).substring(2, 10).toUpperCase();
};