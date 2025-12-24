import EventService from "../services/event.service.js";
import postService from "../services/post.service.js";
import { saveLog } from "../utils/logs.js";
export const getEventById = async (req, res) => {
    const id = req.params.event_id;
    try {
        checkId(id);
        const event = await EventService.getEventById(id);
        return res.status(200).json(event);
    } catch (err) {
        if (err.message === "Event not found") {
            return res.status(404).json({ message: "Event not found" });
        }
        if (err.message === "Invalid ID") {
            return res.status(400).json({ message: "Invalid event ID" });
        }
        return res
            .status(500)
            .json({ message: "Internal server error", error: err.message });
    }
};

/**
 * Register a student for an event
 * @param {Request} req - Express request object containing event_id in params
 * @param {Response} res - Express response object
 * @returns {Response} HTTP response with appropriate status code
 */
export const registerStudentAtEvent = async (req, res) => {
    const event_id = req.params.event_id;
    const student_id = req.user.id;

    try {
        checkId(event_id);
        await EventService.registerStudentAtEvent(event_id, student_id);

        await saveLog({
            ip_address: req.ip,
            user_type: 'student',
            record_id: event_id,
            edited_table: 'std_register_event',
            action: 'register',
            changed_by: student_id.toString()
        });

        return res.status(200).send();
    } catch (err) {
        if (err.message === "Event not found") {
            return res.status(404).json({ message: "Event not found" });
        }
        if (err.message === "Student not found") {
            return res
                .status(404)
                .json({ message: "Student not found or inactive" });
        }
        if (err.message === "Invalid ID") {
            return res.status(400).json({ message: "Invalid event ID" });
        }
        if (err.message === "Event is full") {
            return res.status(400).json({ message: "Event is full" });
        }
        if (err.message === "Registration closed") {
            return res
                .status(400)
                .json({ message: "Registration is closed for this event" });
        }
        if (err.message === "Registration deadline passed") {
            return res
                .status(400)
                .json({ message: "Registration deadline has passed" });
        }
        if (err.message === "Already registered") {
            return res
                .status(409)
                .json({ message: "Student already registered for this event" });
        }
        return res
            .status(500)
            .json({ message: "Internal server error", error: err.message });
    }
};

export const cancelEventRegistration = async (req, res) => {
    const eventId = req.params.event_id;
    const studentId = req.user.id;

    try {
        checkId(eventId);
        await EventService.cancelEventRegistration(eventId, studentId);

        await saveLog({
            ip_address: req.ip,
            user_type: 'student',
            record_id: eventId,
            edited_table: 'std_register_event',
            action: 'cancel_registration',
            changed_by: studentId.toString()
        });

        return res.status(200).json({ message: "Registration cancelled" });
    } catch (err) {
        if (err.message === "Event not found") {
            return res.status(404).json({
                code: 404,
                message: "Not Found",
                details: `Event with ID ${eventId} does not exist`,
            });
        }
        if (err.message === "Invalid ID") {
            return res.status(400).json({ message: "Invalid event ID" });
        }
        if (err.message === "Registration not found") {
            return res.status(404).json({
                code: 404,
                message: "Not Found",
                details: "Student is not registered for this event",
            });
        }
        return res
            .status(500)
            .json({ message: "Internal server error", error: err.message });
    }
};

export const checkInStudent = async (req, res) => {
    const eventId = req.params.event_id;
    const studentId = req.user.id;

    try {
        checkId(eventId);

        await EventService.checkInStudent(eventId, studentId);

        await saveLog({
            ip_address: req.ip,
            user_type: 'student', // or admin/scanner? The code uses `req.user.id` as `studentId`. So it seems student checks themselves in?
            record_id: eventId,
            edited_table: 'std_attend_event',
            action: 'check_in',
            changed_by: studentId.toString()
        });

        return res.status(200).send();
    } catch (err) {
        if (err.message === "Event not found") {
            return res.status(404).json({
                code: 404,
                message: "Not Found",
                details: `Event with ID ${eventId} does not exist`,
            });
        }
        if (err.message === "Student not registered") {
            return res.status(404).json({
                code: 404,
                message: "Not Found",
                details: "Student is not registered for this event",
            });
        }
        if (err.message === "Already checked in") {
            return res.status(400).json({
                code: 400,
                message: "Bad Request",
                details: "Student is already checked in for this event",
            });
        }
        if (err.message === "Invalid ID") {
            return res.status(400).json({ message: "Invalid event ID" });
        }
        return res
            .status(500)
            .json({ message: "Internal server error", error: err.message });
    }
};

export const getRegisteredStudentsForEvent = async (req, res) => {
    const id = req.params.event_id;
    checkId(id);
    try {
        const students = await EventService.getRegisteredStudentsForEvent(id);
        return res.status(200).json(students);
    } catch (err) {
        if (err.message === "Event not found") {
            return res.status(404).json({ message: "Event not found" });
        }
        if (err.message === "Invalid ID") {
            return res.status(400).json({ message: "Invalid event ID" });
        }
        return res
            .status(500)
            .json({ message: "Internal server error", error: err.message });
    }
};

export const getApprovedEvents = async (req, res) => {
    const type = req.query.type;
    const clubId = req.query.club_id;

    try {
        let events;
        if (type && clubId) {
            if (type !== "event" && type !== "session") {
                return res.status(400).json({
                    message: 'Invalid query parameters type should be "event" or "session"',
                });
            }
            if (isNaN(clubId) || clubId <= 0) {
                return res.status(400).json({
                    message: "Invalid query parameters clubId should be a valid Club ID",
                });
            }
            events = await EventService.getApprovedEvents(type, clubId);
        } else {
            // If no filters, fetch all approved events (you might need to update service/repo to handle this, 
            // but looking at the repo, it expects args. For now, let's assume the user wants *all* if nothing is passed, 
            // but the repo method `getApprovedEvents` strictly takes type and clubId.
            // Wait, the user said "I found all these errors when I opened events tab".
            // The frontend is likely calling `/api/events` without params.
            // I need to check `EventService.getApprovedEvents` and `EventRepo.getApprovedEvents`.
            // `EventRepo.getApprovedEvents` uses `WHERE e.club_id = ? AND e.type = ?`.
            // So I cannot just call it without args.
            // I should probably create a new method in repo or modify the existing one to handle nulls, 
            // OR for now, just return all events if no params are passed by calling a different repo method 
            // or modifying the repo query.

            // Let's look at `EventRepo.getAllEvents` which I just fixed. It returns `WHERE status = 'scheduled'`.
            // That seems to be exactly what we want if no filters are applied!
            events = await EventService.getAllEvents();
        }

        if (!events || events.length === 0) {
            return res
                .status(204)
                .json({ message: "No approved events found" });
        }
        return res.status(200).json(events);
    } catch (err) {
        if (err.message === "Club not found") {
            return res.status(404).json({ message: "Club not found" });
        }
        return res
            .status(500)
            .json({ message: "Internal server error", error: err.message });
    }
};

export const getAttendeeListForEvent = async (req, res) => {
    const id = req.params.event_id;
    checkId(id);
    try {
        const attendees = await EventService.getAttendeeListForEvent(id);
        return res.status(200).json(attendees);
    } catch (err) {
        if (err.message === "Event not found") {
            return res.status(404).json({ message: "Event not found" });
        }
        if (err.message === "Invalid ID") {
            return res.status(400).json({ message: "Invalid event ID" });
        }
        return res
            .status(500)
            .json({ message: "Internal server error", error: err.message });
    }
};

export const getAllClubEvents = async (req, res) => {
    const club_manager_id = req.user.id;
    try {
        const events = await EventService.getAllClubEvents(club_manager_id);
        return res.status(200).json(events);
    } catch (err) {
        return res
            .status(500)
            .json({ message: "Internal server error", error: err.message });
    }
};

export const scheduleEvent = async (req, res) => {
    try {
        const type = req.body.type;
        if (type !== "event" && type !== "session") {
            return res.status(400).json({
                message:
                    'Invalid event type. Type should be "event" or "session"',
            });
        }
        const club_manager_id = req.user.id;
        const eventData = {
            type: req.body.type,
            title: req.body.title,
            description: req.body.description,
            startTime: req.body.start_time,
            endTime: req.body.end_time,
            roomId: req.body.room_id,
            club_id: null, // to be set in service
            max_regestrations: req.body.max_registrations,
        };
        const newEventId = await EventService.scheduleEvent(
            club_manager_id,
            eventData
        );

        await saveLog({
            ip_address: req.ip,
            user_type: 'club_manager',
            record_id: newEventId.toString(),
            edited_table: 'events',
            action: 'schedule',
            changed_by: club_manager_id.toString()
        });

        return res.status(201).json({ event_id: newEventId });
    } catch (err) {
        if (err.message === "Club not found") {
            return res.status(404).json({ message: "Club not found" });
        }
        return res
            .status(500)
            .json({ message: "Internal server error", error: err.message });
    }
};

export const deleteEvent = async (req, res) => {
    const id = req.params.event_id;
    try {
        checkId(id);
        await EventService.deleteEvent(id);

        await saveLog({
            ip_address: req.ip,
            user_type: 'admin', // or club manager? Assuming admin or authorized user.
            record_id: id,
            edited_table: 'events',
            action: 'delete',
            changed_by: req.user ? req.user.id.toString() : 'unknown'
        });

        return res.status(200).json({ message: "Event deleted successfully" });
    } catch (err) {
        if (err.message === "Event not found") {
            return res.status(404).json({ message: "Event not found" });
        }
        if (err.message === "Invalid ID") {
            return res.status(400).json({ message: "Invalid event ID" });
        }
        return res
            .status(500)
            .json({ message: "Internal server error", error: err.message });
    }
};

export const getEventPosts = async (req, res) => {
    const eventId = req.params.id;
    const userId = req.user.id;
    try {
        if (!(await EventService.getEventById(eventId))) {
            return res.status(404).json({ message: "Event not found" });
        }
        const posts = await postService.getPostsByEventId(eventId, userId);
        return res.status(200).json(posts);
    } catch (err) {
        return res
            .status(500)
            .json({ message: "Internal server error", error: err.message });
    }
};

export const reportEventIssue = async (req, res) => {
    const { event_id, reason, details } = req.body;
    const userId = req.user.id;

    try {
        if (!event_id || !reason || !details) {
            return res.status(400).json({
                message: 'Missing required fields',
                details: 'event_id, reason, and details are required.'
            });
        }

        await EventService.reportEventIssue(userId, event_id, reason, details);

        await saveLog({
            ip_address: req.ip,
            user_type: 'student',
            record_id: event_id,
            edited_table: 'std_report_event',
            action: 'report_issue',
            changed_by: userId.toString()
        });

        return res.status(200).json({ message: 'Event issue reported successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error reporting event issue: ' + err.message });
    }
};

const checkId = (id) => {
    if (!id || isNaN(id) || id <= 0) throw new Error("Invalid ID");
};
