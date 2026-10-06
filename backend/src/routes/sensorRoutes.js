import express from "express";

import {
  createSensorReading,
  fetchSensorReadings,
} from "../controllers/sensorController.js";

const router = express.Router();

router.post("/", createSensorReading);

router.get("/", fetchSensorReadings);

export default router;