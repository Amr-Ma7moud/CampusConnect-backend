import { Router } from "express";
import {
    getEventById,
    getApprovedEvents,
    getRegisteredStudentsForEvent,
    getAllClubEvents,
    getAttendeeListForEvent,
    scheduleEvent,
} from "../controllers/event.controller.js";
import { verifyRole } from "../middlewares/auth.middleware.js";
const router = Router();

router.get("/", getApprovedEvents);
router.post("/", verifyRole(["club_manager", "admin"]), scheduleEvent);
router.get("/requested", verifyRole(["club_manager"]), getAllClubEvents);
router.get("/:event_id", getEventById);
router.get("/:id/registered_students", getRegisteredStudentsForEvent);
router.get("/:id/attendance_list", getAttendeeListForEvent);
export default router;
