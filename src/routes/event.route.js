import { Router } from "express";
import {
    getEventById,
    getApprovedEvents,
    getRegisteredStudentsForEvent,
    getAllClubEvents,
    getAttendeeListForEvent,
    scheduleEvent,
    deleteEvent,
    registerStudentAtEvent,
    getEventPosts,
} from "../controllers/event.controller.js";
import { verifyRole } from "../middlewares/auth.middleware.js";
const router = Router();

router.post("/", verifyRole(["club_manager", "admin"]), scheduleEvent);
router.post(
    "/:event_id/register",
    verifyRole(["student", "club_manager"]),
    registerStudentAtEvent
);
router.delete("/:event_id", verifyRole(["club_manager", "admin"]), deleteEvent);
router.get("/", getApprovedEvents);
router.get("/requested", verifyRole(["club_manager"]), getAllClubEvents);
router.get("/:event_id", getEventById);
router.get(
    "/:event_id/registered_students",
    verifyRole(["club_manager"]),
    getRegisteredStudentsForEvent
);
router.get(
    "/:event_id/attendance_list",
    verifyRole(["club_manager"]),
    getAttendeeListForEvent
);
router.get("/:event_id/registered_students", getRegisteredStudentsForEvent);
router.get("/:event_id/attendance_list", getAttendeeListForEvent);
router.get("/", getApprovedEvents);
router.get('/:id/posts', getEventPosts);
export default router;
