
import pool from "../config/db.js";

const columns = [
  "nitrogen_mg_kg",
  "phosphorus_mg_kg",
  "potassium_mg_kg",
  "soil_moisture_pct",
  "soil_ph",
  "soil_temperature_c",
  "air_temperature_c",
  "air_humidity_pct",
  "slope_angle_deg",
  "slope_percent",
];

function valuesFromData(data) {
  return [
    data.nitrogen ?? null,
    data.phosphorus ?? null,
    data.potassium ?? null,
    data.soilMoisture ?? null,
    data.soilPh ?? null,
    data.soilTemperature ?? null,
    data.airTemperature ?? null,
    data.airHumidity ?? null,
    data.slopeAngle ?? null,
    data.slopePercent ?? null,
  ];
}

export async function insertSensorReading(data) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const values = valuesFromData(data);
    const columnNames = columns.join(", ");
    const placeholders = columns.map(() => "?").join(", ");

    // Save historical reading
    const [result] = await connection.execute(
      `INSERT INTO sensor_readings
       (device_id, ${columnNames})
       VALUES (?, ${placeholders})`,
      [data.deviceId, ...values]
    );

    const readingId = result.insertId;

    // Insert or replace latest reading for this device
    const updateColumns = [
      "reading_id",
      ...columns,
      "recorded_at",
    ];

    const assignments = updateColumns
      .map((column) => `${column} = ?`)
      .join(", ");

    await connection.execute(
      `INSERT INTO latest_sensor_readings
       (device_id, reading_id, ${columnNames})
       VALUES (?, ?, ${placeholders})
       ON DUPLICATE KEY UPDATE ${assignments}`,
      [
        data.deviceId,
        readingId,
        ...values,
        readingId,
        ...values,
        new Date(),
      ]
    );

    await connection.commit();
    return readingId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function getLatestReading(deviceId) {
  const [rows] = await pool.execute(
    `SELECT * FROM latest_sensor_readings
     WHERE device_id = ?`,
    [deviceId]
  );

  return rows[0] || null;
}

export async function getReadingHistory(
  deviceId,
  limit = 100
) {
  const safeLimit = Math.min(
    Math.max(Number(limit) || 100, 1),
    500
  );

  const [rows] = await pool.query(
    `SELECT * FROM sensor_readings
     WHERE device_id = ?
     ORDER BY id DESC
     LIMIT ?`,
    [deviceId, safeLimit]
  );

  return rows;
}
