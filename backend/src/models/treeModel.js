
import pool from "../config/db.js";

export async function getTreeLatestReading(zoneId, treeCode) {
  const [rows] = await pool.execute(
    `SELECT
        t.tree_id,
        t.tree_code,
        t.zone_id,
        t.device_id,
        t.coconut_variety,
        t.tree_age_years,

        s.reading_id,
        s.nitrogen_mg_kg,
        s.phosphorus_mg_kg,
        s.potassium_mg_kg,
        s.soil_moisture_pct,
        s.soil_ph,
        s.soil_temperature_c,
        s.air_temperature_c,
        s.air_humidity_pct,
        s.slope_angle_deg,
        s.slope_percent,
        s.recorded_at

     FROM coconut_trees t

     LEFT JOIN latest_sensor_readings s
       ON t.device_id = s.device_id

     WHERE t.zone_id = ?
       AND t.tree_code = ?

     LIMIT 1`,
    [zoneId, treeCode]
  );

  return rows[0] || null;
}
