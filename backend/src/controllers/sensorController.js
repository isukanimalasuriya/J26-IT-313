
import {
  insertSensorReading,
  getLatestReading,
  getReadingHistory,
} from "../models/sensorModel.js";

const numericFields = [
  "nitrogen",
  "phosphorus",
  "potassium",
  "soilMoisture",
  "soilPh",
  "soilTemperature",
  "airTemperature",
  "airHumidity",
  "slopeAngle",
  "slopePercent",
];

function validDeviceId(id) {
  return (
    typeof id === "string" &&
    /^[a-zA-Z0-9_-]{1,50}$/.test(id)
  );
}

// ESP32 sends sensor readings
export async function saveSensorData(req, res) {
  try {
    const data = req.body;

    if (!data || !validDeviceId(data.deviceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid device ID",
      });
    }

    for (const field of numericFields) {
      const value = data[field];

      if (
        value !== null &&
        value !== undefined &&
        (
          typeof value !== "number" ||
          !Number.isFinite(value)
        )
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid ${field}`,
        });
      }
    }

    const ranges = {
      nitrogen: [0, 1999],
      phosphorus: [0, 1999],
      potassium: [0, 1999],
      soilMoisture: [0, 100],
      soilPh: [0, 14],
      airHumidity: [0, 100],
      slopeAngle: [0, 90],
    };

    for (const [field, [min, max]] of Object.entries(ranges)) {
      const value = data[field];

      if (value != null && (value < min || value > max)) {
        return res.status(400).json({
          success: false,
          message: `${field} outside allowed range`,
        });
      }
    }

    // Prevent missing values from becoming zero
    const cleanData = { deviceId: data.deviceId };

    for (const field of numericFields) {
      cleanData[field] = data[field] ?? null;
    }

    const readingId = await insertSensorReading(cleanData);

    console.log(
      `✅ Saved sensor reading ${readingId} from ${data.deviceId}`
    );

    return res.status(201).json({
      success: true,
      message: "Sensor data saved successfully",
      readingId,
    });
  } catch (error) {
    console.error("Sensor save error:", error);

    return res.status(500).json({
      success: false,
      message: "Database error",
    });
  }
}

// Get the latest sensor readings
export async function latestSensorData(req, res) {
  try {
    const { deviceId } = req.params;

    if (!validDeviceId(deviceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid device ID",
      });
    }

    const reading = await getLatestReading(deviceId);

    if (!reading) {
      return res.status(404).json({
        success: false,
        message: "No sensor readings found",
      });
    }

    return res.json({
      success: true,
      data: reading,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve reading",
    });
  }
}

// Get historical sensor readings
export async function sensorHistory(req, res) {
  try {
    const { deviceId } = req.params;

    if (!validDeviceId(deviceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid device ID",
      });
    }

    const limit = req.query.limit || 100;

    const readings = await getReadingHistory(
      deviceId,
      limit
    );

    return res.json({
      success: true,
      count: readings.length,
      data: readings,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve history",
    });
  }
}
