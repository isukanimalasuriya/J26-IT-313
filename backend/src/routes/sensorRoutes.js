import express from "express";

import {
  saveSensorData,
  latestSensorData,
  sensorHistory,
} from "../controllers/sensorController.js";

const router = express.Router();

// ESP32 sends sensor data to MySQL
router.post("/", saveSensorData);

// Get latest sensor readings
router.get("/latest/:deviceId", latestSensorData);

// Get historical sensor readings
router.get("/history/:deviceId", sensorHistory);

export default router;