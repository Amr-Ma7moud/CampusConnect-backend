import EventService from "../services/event.service.js";
import postService from "../services/post.service.js";
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
    try {
        const type = req.query.type;
        const clubId = req.query.club_id;
        if (!type || (type !== "event" && type !== "session")) {
            return res.status(400).json({
                message:
                    'Invalid query parameters type should be "event" or "session"',
            });
        }
        if (!clubId || isNaN(clubId) || clubId <= 0) {
            return res.status(400).json({
                message:
                    "Invalid query parameters clubId should be a valid Club ID",
            });
        }
        const events = await EventService.getApprovedEvents(type, clubId);
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
const checkId = (id) => {
    if (!id || isNaN(id) || id <= 0) throw new Error("Invalid ID");
};
