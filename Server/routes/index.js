import express from 'express';
import wordRoutes from './wordRoutes.js';
import pillar1Routes from './pillar1Routes.js';
import pillar2Routes from './pillar2Routes.js';
import pillar3Routes from './pillar3Routes.js';
import pillar4Routes from './pillar4Routes.js';
import pillar5Routes from './pillar5Routes.js';

const router = express.Router();

router.use('/words', wordRoutes);
router.use('/pillar1', pillar1Routes);
router.use('/pillar2', pillar2Routes);
router.use('/pillar3', pillar3Routes);
router.use('/pillar4', pillar4Routes);
router.use('/pillar5', pillar5Routes);

export default router;