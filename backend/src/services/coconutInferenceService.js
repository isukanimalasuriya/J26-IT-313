import { spawn } from 'child_process';
import { open, access } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_DIR = path.resolve(__dirname, '../..');
const MODEL_DIR = path.join(BACKEND_DIR, 'trained_models', 'coconut');
const CLASS_NAMES = ['dry', 'immature', 'matured', 'tender'];
const IMAGE_SIGNATURES = {
  'image/jpeg': (header) =>
    header.length >= 3 &&
    header[0] === 0xff &&
    header[1] === 0xd8 &&
    header[2] === 0xff,
  'image/png': (header) =>
    header.length >= 8 &&
    header.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  'image/webp': (header) =>
    header.length >= 12 &&
    header.toString('ascii', 0, 4) === 'RIFF' &&
    header.toString('ascii', 8, 12) === 'WEBP',
};

export class CoconutInferenceError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = 'CoconutInferenceError';
    this.statusCode = statusCode;
  }
}

async function requireFile(filePath, description) {
  try {
    await access(filePath);
  } catch {
    throw new CoconutInferenceError(`Required ${description} is missing.`);
  }
}

async function validateImageFile(imagePath, mimeType) {
  const isValidSignature = IMAGE_SIGNATURES[mimeType];
  if (!isValidSignature) {
    throw new CoconutInferenceError('Only JPEG, PNG, and WebP images are supported.', 415);
  }

  const file = await open(imagePath, 'r');
  const header = Buffer.alloc(12);
  let bytesRead;

  try {
    ({ bytesRead } = await file.read(header, 0, header.length, 0));
  } finally {
    await file.close();
  }

  if (!isValidSignature(header.subarray(0, bytesRead))) {
    throw new CoconutInferenceError(
      'The uploaded file is not a valid image matching its declared format.',
      400,
    );
  }
}

function isFiniteConfidence(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1;
}

function validateInferenceResult(result) {
  if (!result || typeof result !== 'object' || result.success !== true) {
    throw new CoconutInferenceError('Inference returned an invalid response.', 502);
  }

  const dimensions = result.image_dimensions;
  if (
    !dimensions ||
    !Number.isInteger(dimensions.width) ||
    dimensions.width <= 0 ||
    !Number.isInteger(dimensions.height) ||
    dimensions.height <= 0
  ) {
    throw new CoconutInferenceError('Inference returned invalid image dimensions.', 502);
  }

  if (
    !Number.isInteger(result.detected_coconut_count) ||
    result.detected_coconut_count < 0 ||
    !Array.isArray(result.detections) ||
    result.detections.length !== result.detected_coconut_count
  ) {
    throw new CoconutInferenceError('Inference returned an invalid detection count.', 502);
  }

  const maturityCounts = result.maturity_counts;
  if (
    !maturityCounts ||
    typeof maturityCounts !== 'object' ||
    CLASS_NAMES.some(
      (className) =>
        !Number.isInteger(maturityCounts[className]) || maturityCounts[className] < 0,
    )
  ) {
    throw new CoconutInferenceError('Inference returned invalid maturity counts.', 502);
  }

  const actualCounts = Object.fromEntries(CLASS_NAMES.map((className) => [className, 0]));
  for (const detection of result.detections) {
    const box = detection?.bounding_box;
    if (
      !Number.isInteger(detection?.coconut_index) ||
      !CLASS_NAMES.includes(detection?.maturity) ||
      !isFiniteConfidence(detection?.detection_confidence) ||
      !isFiniteConfidence(detection?.maturity_confidence) ||
      !box ||
      !Number.isInteger(box.x1) ||
      !Number.isInteger(box.y1) ||
      !Number.isInteger(box.x2) ||
      !Number.isInteger(box.y2) ||
      box.x1 < 0 ||
      box.y1 < 0 ||
      box.x2 > dimensions.width ||
      box.y2 > dimensions.height ||
      box.x2 <= box.x1 ||
      box.y2 <= box.y1
    ) {
      throw new CoconutInferenceError('Inference returned an invalid detection.', 502);
    }
    actualCounts[detection.maturity] += 1;
  }

  if (
    CLASS_NAMES.some((className) => maturityCounts[className] !== actualCounts[className])
  ) {
    throw new CoconutInferenceError('Inference returned inconsistent maturity counts.', 502);
  }

  return result;
}

function runPythonInference(pythonPath, scriptPath, imagePath) {
  return new Promise((resolve, reject) => {
    const process = spawn(pythonPath, [scriptPath, imagePath], {
      cwd: BACKEND_DIR,
      windowsHide: true,
    });
    let output = '';
    let errorOutput = '';

    process.stdout.setEncoding('utf8');
    process.stderr.setEncoding('utf8');
    process.stdout.on('data', (chunk) => {
      output += chunk;
    });
    process.stderr.on('data', (chunk) => {
      errorOutput += chunk;
    });
    process.once('error', (error) => {
      reject(new CoconutInferenceError(`Unable to start coconut inference: ${error.message}`));
    });
    process.once('close', (code) => {
      if (code !== 0) {
        const stderrMessage = errorOutput.trim();
        const safeMessage = 'Coconut analysis could not complete because the AI runtime is unavailable.';
        const error = new CoconutInferenceError(safeMessage);
        error.details = stderrMessage || `Process exited with code ${code}.`;
        return reject(error);
      }

      try {
        resolve(JSON.parse(output.trim()));
      } catch (error) {
        reject(
          new CoconutInferenceError(
            `Coconut inference returned invalid JSON: ${error.message}`,
            502,
          ),
        );
      }
    });
  });
}

export async function analyzeImageFile(imagePath, mimeType) {
  const pythonPath = path.join(
    BACKEND_DIR,
    '.venv311',
    process.platform === 'win32' ? 'Scripts' : 'bin',
    process.platform === 'win32' ? 'python.exe' : 'python',
  );
  const scriptPath = path.join(BACKEND_DIR, 'processing', 'coconut_inference.py');
  const requiredFiles = [
    [pythonPath, 'Python executable'],
    [scriptPath, 'coconut inference script'],
    [path.join(MODEL_DIR, 'coconut_yolov8n.pt'), 'coconut detector model'],
    [path.join(MODEL_DIR, 'efficientnetb2_stage2_best.keras'), 'coconut classifier model'],
    [path.join(MODEL_DIR, 'class_names.json'), 'coconut class mapping'],
  ];

  for (const [filePath, description] of requiredFiles) {
    await requireFile(filePath, description);
  }

  await validateImageFile(imagePath, mimeType);
  const result = await runPythonInference(pythonPath, scriptPath, imagePath);
  return validateInferenceResult(result);
}
