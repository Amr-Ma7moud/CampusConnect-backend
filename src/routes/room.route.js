import express from 'express';
import { cancelReservation, reserveRoom } from '../controllers/room.controller.js';

const router = express.Router();

router.post('/reserve', reserveRoom);
router.patch('/:id/cancel', cancelReservation);
router.get('/', );

export default router;