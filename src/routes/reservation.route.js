import express from 'express';
import { getMyActiveReservations, cancelMyReservation } from '../controllers/reservation.controller.js';
import { verifyRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', verifyRole(['student']), getMyActiveReservations);
router.patch('/',
    verifyRole(['student']),
    cancelMyReservation
)

export default router;
