import express from 'express';
import { predictFertilizer } from '../controllers/fertilizerController.js';

const router = express.Router();

router.post('/predict', predictFertilizer);

export default router;