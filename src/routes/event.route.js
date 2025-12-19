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

router.post("/", verifyRole(["club_manager", "admin"]), scheduleEvent);
router.delete("/:event_id", verifyRole(["club_manager", "admin"]), deleteEvent);
router.get("/requested", verifyRole(["club_manager"]), getAllClubEvents);
router.get("/:event_id", getEventById);
router.get("/:event_id/registered_students", getRegisteredStudentsForEvent);
router.get("/:event_id/attendance_list", getAttendeeListForEvent);
router.get("/", getApprovedEvents);
export default router;
