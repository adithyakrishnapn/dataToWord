import express from 'express';
import wordRoutes from './wordRoutes.js';
import pillar1Routes from './pillar1Routes.js';

const router = express.Router();

router.use('/words', wordRoutes);
router.use('/pillar1', pillar1Routes);

export default router;