import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const runFertilizerPrediction = (inputData) => {
  return new Promise((resolve, reject) => {
    const pythonPath = path.resolve(
      __dirname,
      '../../.venv311/Scripts/python.exe'
    );

    const scriptPath = path.resolve(
      __dirname,
      '../../processing/inference_runner.py'
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
            errorOutput || 'Python prediction process failed'
          )
        );
      }

      try {
        const result = JSON.parse(output.trim());
        resolve(result);
      } catch (error) {
        reject(
          new Error(
            `Unable to parse prediction result: ${error.message}`
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