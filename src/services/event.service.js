import { EventRepo } from '../repositories/event.repository.js';
class EventService {
    async getEventById(id) {
        const event = await EventRepo.getEventById(id);
        if (!event) {
            throw new Error('Event not found');
        }
        return event;
    }
}

export default new EventService();