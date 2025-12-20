import express from 'express';
import { cancelReservation, getAllRooms, reportRoomIssue, reserveRoom } from '../controllers/room.controller.js';

const router = express.Router();

router.post('/reserve', reserveRoom);
router.patch('/:id/cancel', cancelReservation);
router.get('/', getAllRooms);
router.post('/report', reportRoomIssue);

export default router;