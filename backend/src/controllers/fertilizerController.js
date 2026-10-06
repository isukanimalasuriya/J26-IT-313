import { runFertilizerPrediction } from '../services/fertilizerService.js';


export const predictFertilizer = async (req, res) => {
  try {
    const inputData = req.body;

    const requiredFields = [
      'tree_age_years',
      'soil_ph',
      'nitrogen_mg_kg',
      'phosphorus_mg_kg',
      'potassium_mg_kg',
      'soil_moisture_pct',
      'salinity_ds_m',
      'organic_matter_pct',
      'slope_angle_deg',
      'mulch_present',
      'rainfall_previous_7d_mm',
      'rainfall_forecast_7d_mm',
      'agro_climatic_zone',
      'soil_texture',
      'coconut_variety',
      'rainfall_intensity',
    ];

    const missingFields = requiredFields.filter(
      (field) =>
        inputData[field] === undefined ||
        inputData[field] === null ||
        inputData[field] === ''
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        missingFields,
      });
    }

    const result = await runFertilizerPrediction(inputData);

    return res.status(200).json({
      success: true,
      message: 'Fertilizer prediction successful',
      data: result,
    });

  } catch (error) {
    console.error('Fertilizer prediction error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to predict fertilizer amount',
      error: error.message,
    });
  }
};