import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendOTP } from "../utils/mailer.js";

import {
  createUser,
  findUserByEmail,
  verifyUser,
  saveResetToken,
  findUserByResetToken,
  updatePassword,
} from "../models/users.js";

const JWT_SECRET = process.env.JWT_SECRET;

// REGISTER
export const registerUser = async ({ name, email, password, phone_number }) => {
  const existing = await findUserByEmail(email);
  if (existing) throw new Error("Email already exists");

  const hashed = await bcrypt.hash(password, 10);

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = new Date(Date.now() + 10 * 60 * 1000);

  const user = await createUser({
    name,
    email,
    password: hashed,
    phone_number,
    otp,
    otp_expiry: expiry,
  });

  await sendOTP(email, otp);

  return user;
};

// VERIFY OTP
export const verifyOTP = async ({ email, otp }) => {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("User not found");

  if (user.otp !== otp) throw new Error("Invalid OTP");
  if (new Date() > user.otp_expiry)
    throw new Error("OTP expired");

  await verifyUser(email);

  return true;
};

// LOGIN
export const loginUser = async ({ email, password }) => {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("Invalid credentials");

  if (!user.is_verified)
    throw new Error("Verify your email first");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error("Invalid credentials");

  const token = jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  return { user, token };
};

// FORGOT PASSWORD
export const forgotPassword = async (email) => {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("User not found");

  const token = crypto.randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 10 * 60 * 1000);

  await saveResetToken(email, token, expiry);

  await sendOTP(email, token);

  return true;
};

// RESET PASSWORD
export const resetPassword = async ({ token, newPassword }) => {
  const user = await findUserByResetToken(token);
  if (!user) throw new Error("Invalid token");

  if (new Date() > user.reset_token_expiry)
    throw new Error("Token expired");

  const hashed = await bcrypt.hash(newPassword, 10);

  await updatePassword(user.id, hashed);

  return true;
};