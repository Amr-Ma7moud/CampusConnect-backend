import { Router } from "express";
import { createRoom } from "../controllers/room.controller.js";
import { createFacility } from "../controllers/facility.controller.js";
import { verifyRole } from "../middlewares/auth.middleware.js";
import { createUser } from "../controllers/user.controller.js";
import { getAttendaceOverview, getReports, getStats, listPendingEvents } from "../controllers/admin.controller.js";

const router = Router();

router.use(verifyRole(['admin']));

router.post('/rooms', createRoom);
router.post('/facilities', createFacility );
router.post('/users', createUser);
router.get('/report', getReports);
router.get('/stats', getStats);
router.get('/attendance', getAttendaceOverview);
router.get('/admin/approvals/events', listPendingEvents);

export default router;