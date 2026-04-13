import pool from "../config/db.js";

// CREATE USER
export const createUser = async ({
  name,
  email,
  password,
  phone_number,
  otp,
  otp_expiry,
}) => {
  const result = await pool.query(
    `INSERT INTO system_users (name, email, password, phone_number, otp, otp_expiry)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING id, name, email, phone_number, is_verified`,
    [name, email, password, phone_number, otp, otp_expiry]
  );

  return result.rows[0];
};

// FIND USER BY EMAIL
export const findUserByEmail = async (email) => {
  const result = await pool.query(
    "SELECT * FROM system_users WHERE email=$1",
    [email]
  );
  return result.rows[0];
};

// VERIFY USER
export const verifyUser = async (email) => {
  await pool.query(
    `UPDATE system_users 
     SET is_verified=true, otp=NULL, otp_expiry=NULL 
     WHERE email=$1`,
    [email]
  );
};

// SAVE RESET TOKEN
export const saveResetToken = async (email, token, expiry) => {
  await pool.query(
    `UPDATE system_users 
     SET reset_token=$1, reset_token_expiry=$2 
     WHERE email=$3`,
    [token, expiry, email]
  );
};

// FIND USER BY RESET TOKEN
export const findUserByResetToken = async (token) => {
  const result = await pool.query(
    "SELECT * FROM system_users WHERE reset_token=$1",
    [token]
  );
  return result.rows[0];
};

// UPDATE PASSWORD
export const updatePassword = async (userId, password) => {
  await pool.query(
    `UPDATE system_users 
     SET password=$1, reset_token=NULL, reset_token_expiry=NULL 
     WHERE id=$2`,
    [password, userId]
  );
};