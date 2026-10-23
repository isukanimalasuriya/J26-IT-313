import { Router } from 'express';
import { testDbConnection } from '../config/db.js';
import fertilizerRoutes from './fertilizerRoutes.js';
import financeRoutes from './financeRoutes.js';

const router = Router();

// Health check endpoint verifying system & MySQL database connectivity
router.get('/health', async (req, res) => {
  const dbStatus = await testDbConnection();

  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    database: dbStatus,
  });
});

// Fertilizer prediction routes
router.use('/fertilizer', fertilizerRoutes);

// Finance forecasting and risk assessment routes
router.use('/finance', financeRoutes);

export default router;