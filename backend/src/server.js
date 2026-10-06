import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/index.js';
import sensorRoutes from "./routes/sensorRoutes.js";
import { testDbConnection } from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:8081,http://127.0.0.1:8081,http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev; can tighten for prod
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Coconut Research Backend API (SERN Stack)',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: '/api/health',
    },
  });
});

// Mount API routes
app.use('/api', apiRouter);
app.use('/api/sensors', sensorRoutes);

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Checking MySQL database connection...`);
  const dbStatus = await testDbConnection();
  console.log(`Database status:`, dbStatus);
});

export default app;
