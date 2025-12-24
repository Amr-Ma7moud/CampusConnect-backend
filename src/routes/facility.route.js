import express from 'express';
import { reportFacilityIssue } from '../controllers/facility.controller.js';

const router = express.Router();


// router.get('/', );
// router.post('/:id/reserve', );
// router.post('/:id/checkin', );
router.post('/report', reportFacilityIssue);

export default router;