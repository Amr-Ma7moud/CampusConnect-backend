import EventRepo from "../repositories/event.repository.js";
import clubService from "./club.service.js";
class EventService {
    async getEventById(id) {
        const event = await EventRepo.getEventById(id);
        if (!event) {
            throw new Error("Event not found");
        }
        return event;
    }

    async getRegisteredStudentsForEvent(id) {
        if (!(await EventRepo.isEventExists(id))) {
            throw new Error("Event not found");
        }
        const students = await EventRepo.getRegisteredStudentsForEvent(id);
        return students;
    }

    async getAttendeeListForEvent(id) {
        if (!(await EventRepo.isEventExists(id))) {
            throw new Error("Event not found");
        }
        const attendees = await EventRepo.getAttendeeListForEvent(id);
        return attendees;
    }

    async getAllClubEvents(club_manager_id) {
        const events = await EventRepo.getAllClubEvents(club_manager_id);
        return events;
    }

    async getApprovedEvents(type, clubId) {
        if (!(await clubService.findClubById(clubId))) {
            throw new Error("Club not found");
        }
        const events = await EventRepo.getApprovedEvents(type, clubId);
        return events;
    }

    async scheduleEvent(club_manager_id, eventData) {
        const clubId = await clubService.getClubIdByManagerId(club_manager_id);
        if (!clubId) {
            throw new Error("Club not found");
        }
        eventData.club_id = clubId;
        const newEvent = await EventRepo.scheduleEvent(eventData);
        return newEvent;
    }

    async deleteEvent(id) {
        if (!(await EventRepo.isEventExists(id))) {
            throw new Error("Event not found");
        }
        await EventRepo.deleteEvent(id);
    }

    /**
     * Register a student for an event with all necessary validations
     * @param {number} eventId - The event ID to register for
     * @param {number} studentId - The student ID to register
     * @throws {Error} "Event not found" if event doesn't exist
     * @throws {Error} "Student not found" if student doesn't exist or is inactive
     * @throws {Error} "Already registered" if student is already registered
     * @throws {Error} "Event is full" if event has reached maximum capacity
     * @throws {Error} "Registration closed" if event is not in scheduled status
     * @throws {Error} "Registration deadline passed" if current time is past event start time
     * @returns {number} The registration ID
     */
    async registerStudentAtEvent(eventId, studentId) {
        if (!(await EventRepo.isEventExists(eventId))) {
            throw new Error("Event not found");
        }

        const eventInfo = await EventRepo.getEventStatusAndTiming(eventId);
        if (!eventInfo) {
            throw new Error("Event not found");
        }

        if (eventInfo.status !== "scheduled") {
            throw new Error("Registration closed");
        }

        const currentTime = new Date();
        const eventStartTime = new Date(eventInfo.event_start_date);
        if (currentTime >= eventStartTime) {
            throw new Error("Registration deadline passed");
        }

        if (await EventRepo.isStudentRegisteredForEvent(eventId, studentId)) {
            throw new Error("Already registered");
        }

        const eventCapacity = await EventRepo.getEventCapacity(eventId);
        if (eventCapacity && eventCapacity.max_capacity) {
            const currentRegistrations =
                await EventRepo.getEventRegistrationCount(eventId);
            if (currentRegistrations >= eventCapacity.max_capacity) {
                throw new Error("Event is full");
            }
        }

        const registrationId = await EventRepo.registerStudentForEvent(
            eventId,
            studentId
        );
        return registrationId;
    }

    /**
     * Cancel a student's registration for an event with all necessary validations
     * @param {number} eventId - The event ID to cancel registration for
     * @param {number} studentId - The student ID to cancel registration for
     * @throws {Error} "Event not found" if event doesn't exist
     * @throws {Error} "Registration not found" if student is not registered for the event
     * @returns {boolean} True if cancellation was successful
     */
    async cancelEventRegistration(eventId, studentId) {
        if (!(await EventRepo.isEventExists(eventId))) {
            throw new Error("Event not found");
        }

        if (
            !(await EventRepo.isStudentRegisteredForEvent(eventId, studentId))
        ) {
            throw new Error("Registration not found");
        }

        const cancelled = await EventRepo.cancelStudentRegistration(
            eventId,
            studentId
        );
        return cancelled;
    }

    async checkInStudent(eventId, studentId) {
        if (!(await EventRepo.isEventExists(eventId))) {
            throw new Error("Event not found");
        }

        if (
            !(await EventRepo.isStudentRegisteredForEvent(eventId, studentId))
        ) {
            throw new Error("Student not registered");
        }

        if (await EventRepo.isStudentCheckedIn(eventId, studentId)) {
            throw new Error("Already checked in");
        }

        const checkInId = await EventRepo.checkInStudent(eventId, studentId);
        return checkInId;
    }

    async getEventTime(id) {
        // TODO
    }

    async reportEventIssue(student_id, event_id, reason, details) {
        try {
            const reportData = [student_id, event_id, reason, details];
            const result = await EventRepo.reportEventIssue(reportData);
            return result;
        } catch (error) {
            throw new Error('Error in EventService: ' + error.message);
        }
    }
}

export default new EventService();
