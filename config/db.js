import pkg from "pg";

const { Pool } = pkg;

const buildPoolConfig = () => {
  const uri = process.env.POSTGRES_URI;

  if (!uri) {
    throw new Error("POSTGRES_URI is missing");
  }

  const parsed = new URL(uri);

  return {
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 5432,
    database: parsed.pathname.replace(/^\//, ""),
    ssl: {
      rejectUnauthorized: false,
    },
  };
};

const pool = new Pool(buildPoolConfig());

export const connectDB = async () => {
  try {
    console.log("🔗 DB:", process.env.POSTGRES_URI);

    const client = await pool.connect();
    console.log("✅ Connected to Neon DB");
    client.release();
  } catch (error) {
    console.error("❌ DB error:", error.message);
    throw error;
  }
};

export default pool;