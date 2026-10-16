import { randomUUID } from 'crypto';
import { tmpdir } from 'os';
import path from 'path';
import multer from 'multer';
import { Router } from 'express';
import { analyzeCoconutImage } from '../controllers/coconutController.js';

const MIME_EXTENSIONS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

class UnsupportedImageTypeError extends Error {}

const upload = multer({
  storage: multer.diskStorage({
    destination: tmpdir(),
    filename: (req, file, callback) => {
      callback(null, `${randomUUID()}${MIME_EXTENSIONS[file.mimetype] || ''}`);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (req, file, callback) => {
    if (!Object.hasOwn(MIME_EXTENSIONS, file.mimetype)) {
      return callback(new UnsupportedImageTypeError('Only JPEG, PNG, and WebP images are supported.'));
    }
    callback(null, true);
  },
});

const router = Router();

router.post('/analyze', (req, res, next) => {
  upload.single('image')(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error instanceof UnsupportedImageTypeError) {
      return res.status(415).json({ success: false, error: error.message });
    }

    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        error: 'Image exceeds the 10 MB upload limit.',
      });
    }

    if (error instanceof multer.MulterError) {
      return res.status(400).json({ success: false, error: error.message });
    }

    console.error('Coconut upload error:', error);
    return res.status(500).json({
      success: false,
      error: 'Unable to receive the uploaded image.',
    });
  });
}, analyzeCoconutImage);

export default router;
