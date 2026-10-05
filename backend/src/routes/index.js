import { Router } from 'express';
import { testDbConnection } from '../config/db.js';

const router = Router();

//Health check endpoint verifying system & MySQL database connectivity
 
router.get('/health', async (req, res) => {
  const dbStatus = await testDbConnection();
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    database: dbStatus,
  });
});

// Mount routes in here

export default router;
