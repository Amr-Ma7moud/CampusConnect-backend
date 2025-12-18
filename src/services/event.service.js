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
}

export default new EventService();