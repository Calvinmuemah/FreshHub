import * as service from "../services/auth.js";

export const register = async (req, res) => {
  try {
    const user = await service.registerUser(req.body);
    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    await service.verifyOTP(req.body);
    res.json({ success: true, message: "Verified successfully" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { user, token } = await service.loginUser(req.body);
    res.json({ success: true, user, token });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    await service.forgotPassword(req.body.email);
    res.json({ success: true, message: "Reset link sent" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    await service.resetPassword(req.body);
    res.json({ success: true, message: "Password updated" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};