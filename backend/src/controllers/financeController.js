import { runFinanceForecast } from '../services/financeService.js';

export const getFinanceForecast = async (req, res) => {
  try {
    const inputData = req.body || {};

    if (inputData.land_size_acres !== undefined && Number(inputData.land_size_acres) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'land_size_acres must be a positive number greater than 0'
      });
    }

    const result = await runFinanceForecast(inputData);

    return res.status(200).json({
      success: true,
      message: 'Financial forecast and risk assessment generated successfully',
      data: result
    });
  } catch (error) {
    console.error('Finance forecast error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to generate financial forecast',
      error: error.message
    });
  }
};
