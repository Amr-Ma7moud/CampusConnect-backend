import EventRepo from '../repositories/event.repository.js';
class EventService {
    async getEventById(id) {
        const event = await EventRepo.getEventById(id);
        if (!event) {
            throw new Error('Event not found');
        }
        return event;
    }

    async getRegisteredStudentsForEvent(id) {
        if (! await EventRepo.isEventExists(id)) {
            throw new Error('Event not found');
        }
        const students = await EventRepo.getRegisteredStudentsForEvent(id);
        return students;
    }

    async getAttendeeListForEvent(id) {
        if (! await EventRepo.isEventExists(id)) {
            throw new Error('Event not found');
        }
        const attendees = await EventRepo.getAttendeeListForEvent(id);
        return attendees;
    };

    async getAllClubEvents(club_manager_id){
        const events = await EventRepo.getAllClubEvents(club_manager_id);
        return events;
    };
    
    async getEventTime(id){
        // TODO
    };
}

export default new EventService();