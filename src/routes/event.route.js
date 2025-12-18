import { Router } from 'express';
import { getEventById , getRegisteredStudentsForEvent } from '../controllers/event.controller.js';
const router = Router();

router.get('/:event_id', getEventById);
router.get('/:id/registered_students', getRegisteredStudentsForEvent);
router.get('/:id/attendance_list', getAttendeeListForEvent);
export default router;