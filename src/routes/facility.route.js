import express from 'express';
import { getFacilities, reportFacilityIssue, reserveFacility ,updateFacility} from '../controllers/facility.controller.js';
import { verifyRole } from '../middlewares/auth.middleware.js';

const router = express.Router();


router.get('/', getFacilities);
router.post('/:id/reserve', verifyRole(['student', 'club_manager']), reserveFacility);
// router.post('/:id/checkin', );
router.post('/report', reportFacilityIssue);
router.patch('/:id', verifyRole(['admin']), updateFacility);
export default router;
