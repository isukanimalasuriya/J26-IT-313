
import { getTreeLatestReading } from "../models/treeModel.js";

export async function getTreeLiveData(req, res) {
  try {
    const zoneId = req.params.zoneId.toUpperCase();
    const treeCode = req.params.treeCode.toUpperCase();

    if (
      !/^[A-Z0-9_-]{1,10}$/.test(zoneId) ||
      !/^[A-Z0-9_-]{1,50}$/.test(treeCode)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid zone or tree code",
      });
    }

    const tree = await getTreeLatestReading(
      zoneId,
      treeCode
    );

    if (!tree) {
      return res.status(404).json({
        success: false,
        message: "Tree not found",
      });
    }

    const lastUpdated = tree.recorded_at
      ? new Date(tree.recorded_at)
      : null;

    const isOnline =
      lastUpdated !== null &&
      !Number.isNaN(lastUpdated.getTime()) &&
      Date.now() - lastUpdated.getTime() >= 0 &&
      Date.now() - lastUpdated.getTime() < 60000;

    return res.json({
      success: true,
      data: {
        treeId: tree.tree_id,
        treeCode: tree.tree_code,
        zoneId: tree.zone_id,
        deviceId: tree.device_id,
        coconutVariety: tree.coconut_variety,
        treeAge: tree.tree_age_years,

        sensor: {
          nitrogen: tree.nitrogen_mg_kg,
          phosphorus: tree.phosphorus_mg_kg,
          potassium: tree.potassium_mg_kg,
          moisture: tree.soil_moisture_pct,
          ph: tree.soil_ph,
          soilTemperature: tree.soil_temperature_c,
          airTemperature: tree.air_temperature_c,
          airHumidity: tree.air_humidity_pct,
          slope: tree.slope_angle_deg,
          slopePercent: tree.slope_percent,
        },

        isOnline,
        lastUpdated,
      },
    });
  } catch (error) {
    console.error("Tree live data error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch tree readings",
    });
  }
}
