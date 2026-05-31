import express from 'express';
import { getResult } from '../controllers/result.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/:driveId/:type', protect, getResult);

export default router;