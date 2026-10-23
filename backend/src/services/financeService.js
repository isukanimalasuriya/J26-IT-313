import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const runFinanceForecast = (inputData) => {
  return new Promise((resolve, reject) => {
    // Check root .venv311 first, then backend .venv311, then fallback to python
    const rootVenv = path.resolve(__dirname, '../../../.venv311/Scripts/python.exe');
    const backendVenv = path.resolve(__dirname, '../../.venv311/Scripts/python.exe');
    
    let pythonPath = 'python';
    if (fs.existsSync(rootVenv)) {
      pythonPath = rootVenv;
    } else if (fs.existsSync(backendVenv)) {
      pythonPath = backendVenv;
    }

    const scriptPath = path.resolve(
      __dirname,
      '../../processing/finance_inference_runner.py'
    );

    const jsonInput = JSON.stringify(inputData);

    const pythonProcess = spawn(pythonPath, [
      scriptPath,
      jsonInput,
    ]);

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        return reject(
          new Error(
            errorOutput || `Python finance prediction process failed with exit code ${code}`
          )
        );
      }

      try {
        const result = JSON.parse(output.trim());
        resolve(result);
      } catch (error) {
        reject(
          new Error(
            `Unable to parse finance prediction result: ${error.message}. Output was: ${output}`
          )
        );
      }
    });

    pythonProcess.on('error', (error) => {
      reject(
        new Error(
          `Unable to start Python process: ${error.message}`
        )
      );
    });
  });
};
