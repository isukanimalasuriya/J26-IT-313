import { unlink } from 'fs/promises';
import { analyzeImageFile } from '../services/coconutInferenceService.js';

export async function analyzeCoconutImage(req, res) {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'An image file is required in the "image" field.',
    });
  }

  let result;
  let failure;

  try {
    result = await analyzeImageFile(req.file.path, req.file.mimetype);
  } catch (error) {
    failure = error;
    if (process.env.NODE_ENV !== 'production') {
      console.error('Coconut image analysis error:', error.details || error.message || error);
    }
  }

  try {
    await unlink(req.file.path);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('Coconut upload cleanup error:', error);
      failure = new Error('Unable to clean up the uploaded image.');
      failure.statusCode = 500;
    }
  }

  if (failure) {
    return res.status(failure.statusCode || 500).json({
      success: false,
      error: failure.message || 'Coconut image analysis failed.',
    });
  }

  return res.status(200).json(result);
}
