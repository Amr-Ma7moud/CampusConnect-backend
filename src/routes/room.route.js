import express from 'express';
import { cancelReservation, createResource, createRoom, getAllResources, getAllRooms, reportRoomIssue, reserveRoom ,updateRoom} from '../controllers/room.controller.js';
import { verifyRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/reserve', reserveRoom);
router.patch('/:id/cancel', cancelReservation);
router.get('/', getAllRooms);
router.post('/report', reportRoomIssue);
router.post('/', verifyRole(['admin']), createRoom);
router.post('/resources', createResource);
router.get('/resources', getAllResources);
router.patch("/:id", verifyRole(['admin']), updateRoom);
export default router;