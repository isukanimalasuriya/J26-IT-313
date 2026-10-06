import {
  saveSensorReading,
  getSensorReadings,
} from "../services/sensorService.js";

export const createSensorReading = async (req, res) => {
  try {
    const {
      deviceId,
      nitrogen,
      phosphorus,
      potassium,
      soilMoisture,
      soilPh,
      salinity,
    } = req.body;

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: "deviceId is required",
      });
    }

    const result = await saveSensorReading({
      deviceId,
      nitrogen,
      phosphorus,
      potassium,
      soilMoisture,
      soilPh,
      salinity,
    });

    res.status(201).json({
      success: true,
      message: "Sensor reading saved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Create sensor reading error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to save sensor reading",
    });
  }
};

export const fetchSensorReadings = async (req, res) => {
  try {
    const readings = await getSensorReadings();

    res.status(200).json({
      success: true,
      count: readings.length,
      data: readings,
    });
  } catch (error) {
    console.error("Get sensor readings error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get sensor readings",
    });
  }
};