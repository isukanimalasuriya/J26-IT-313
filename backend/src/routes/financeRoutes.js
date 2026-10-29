import express from 'express';
import { getFinanceForecast } from '../controllers/financeController.js';

const router = express.Router();

// Generate financial forecast and risk assessment from farm parameters
router.post('/forecast', getFinanceForecast);

// Quick test endpoint with default farm parameters
router.get('/forecast', (req, res) => {
  req.body = { district: 'Kurunegala', land_size_acres: 5.0 };
  return getFinanceForecast(req, res);
});

export default router;
