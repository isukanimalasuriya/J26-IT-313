import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { spawn, spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './routes/index.js';
import sensorRoutes from "./routes/sensorRoutes.js";
import treeRoutes from "./routes/treeRoutes.js";
import { testDbConnection } from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FASTAPI_PORT = process.env.FASTAPI_PORT || 8000;
const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const configuredPythonPath = process.env.PYTHON_PATH;
const pythonPath = configuredPythonPath
  ? (path.isAbsolute(configuredPythonPath)
    ? configuredPythonPath
    : path.resolve(backendRoot, configuredPythonPath))
  : path.join(backendRoot, '.venv', 'Scripts', 'python.exe');
let fastApiProcess;

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
app.use("/api/zones", treeRoutes);

function startFastApi() {
  fastApiProcess = spawn(
    pythonPath,
    [
      '-m',
      'uvicorn',
      'disease_api:app',
      '--host',
      '0.0.0.0',
      '--port',
      String(FASTAPI_PORT),
    ],
    {
      cwd: path.join(backendRoot, 'processing'),
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    }
  );

  fastApiProcess.stdout.on('data', (data) => {
    console.log(`[FastAPI] ${data.toString().trim()}`);
  });
  fastApiProcess.stderr.on('data', (data) => {
    console.error(`[FastAPI] ${data.toString().trim()}`);
  });
  fastApiProcess.on('error', (error) => {
    console.error(`Unable to start FastAPI: ${error.message}`);
  });
  fastApiProcess.on('exit', (code, signal) => {
    if (code !== 0 && signal !== 'SIGTERM') {
      console.error(`FastAPI stopped unexpectedly (code ${code}, signal ${signal})`);
    }
  });
}

function stopFastApi() {
  if (fastApiProcess && fastApiProcess.pid && !fastApiProcess.killed) {
    // /T kills the whole process tree, /F forces it (Windows)
    spawnSync('taskkill', ['/pid', String(fastApiProcess.pid), '/T', '/F'], {
      stdio: 'ignore',
    });
  }
}

startFastApi();

// Start server (keep a reference so we can close it)
const server = app.listen(PORT, "0.0.0.0", async () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Local network URL: http://10.67.165.135:${PORT}`);
  console.log(`Sensor endpoint: http://10.67.165.135:${PORT}/api/sensors`);

  console.log(`Checking MySQL database connection...`);
  const dbStatus = await testDbConnection();
  console.log(`Database status:`, dbStatus);
});

let shuttingDown = false;
function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log('Shutting down...');
  stopFastApi();
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 2000).unref(); // force exit if connections linger
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('SIGBREAK', shutdown); // Windows: closing the terminal / Ctrl+Break

export default app;
