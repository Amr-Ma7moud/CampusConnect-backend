import express from 'express';
import { getMyActiveReservations, cancelMyReservation } from '../controllers/reservation.controller.js';
import { verifyRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', verifyRole(['student', 'club_manager']), getMyActiveReservations);
router.patch('/',
    verifyRole(['student', 'club_manager']),
    cancelMyReservation
)
export default router;
