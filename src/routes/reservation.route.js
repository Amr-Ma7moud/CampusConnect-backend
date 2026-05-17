import express from 'express';
import { getMyActiveReservations } from '../controllers/reservation.controller.js';
import { verifyRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', verifyRole(['student', 'club_manager']), getMyActiveReservations);

export default router;
