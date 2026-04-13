import dotenv from "dotenv";
dotenv.config({ quiet: true });

import express from "express";
import cors from "cors";
import morgan from "morgan";

import authRoutes from "./routes/authroutes.js";
import dataRoutes from "./routes/dataRoutes.js";
import deviceRoutes from "./routes/device.routes.js";

const app = express();

// Middleware
app.use(morgan("combined")); // HTTP request logger
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:8080"],
  })
);

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/data", dataRoutes);
app.use("/api/v1/devices", deviceRoutes);


// Health check
app.get("/", (req, res) => {
  res.send("API is running...");
});

export default app;
