import express from 'express';
import { getFacilities, reportFacilityIssue } from '../controllers/facility.controller.js';

const router = express.Router();


router.get('/', getFacilities);
// router.post('/:id/reserve', );
// router.post('/:id/checkin', );
router.post('/report', reportFacilityIssue);

export default router;