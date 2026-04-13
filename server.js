import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Ensure correct .env path (VERY IMPORTANT in your case)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const startServer = async () => {
  const dbState = {
    connected: false,
    checkedAt: null,
    message: "Not checked",
  };

  try {
    // Import after dotenv config so modules can safely read env vars.
    const [{ default: app }, { connectDB }] = await Promise.all([
      import("./app.js"),
      import("./config/db.js"),
    ]);

    // DEBUG: confirm env is loaded
    console.log("🔍 POSTGRES_URI:", process.env.POSTGRES_URI);

    if (!process.env.POSTGRES_URI) {
      dbState.checkedAt = new Date().toISOString();
      dbState.message = "POSTGRES_URI is missing";
      console.warn("⚠️ Skipping DB connection: POSTGRES_URI is missing");
    } else {
      try {
        await connectDB();
        dbState.connected = true;
        dbState.checkedAt = new Date().toISOString();
        dbState.message = "Connected";
      } catch (dbError) {
        const detailMessage =
          dbError?.message ||
          (Array.isArray(dbError?.errors)
            ? dbError.errors
                .map((item) => item?.message || item?.code)
                .filter(Boolean)
                .join(" | ")
            : "Database connection failed");

        dbState.checkedAt = new Date().toISOString();
        dbState.message = detailMessage;
        console.warn("⚠️ DB unavailable, server will run in degraded mode");
      }
    }

    app.get("/health/db", (req, res) => {
      const statusCode = dbState.connected ? 200 : 503;
      res.status(statusCode).json({
        success: dbState.connected,
        db: dbState,
      });
    });

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("❌ Failed to start server:");
    console.error(error);
    process.exit(1);
  }
};

startServer();