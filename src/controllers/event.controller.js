import { EventService } from '../services/event.service.js';
export const getEventById = async (req, res) => {
    const id  = req.params.event_id;
    try {
        if (!id || isNaN(id) || id <= 0)
            return res.status(400).json({ message: 'Invalid event ID' });
        const event = await EventService.getEventById(id);
        return res.status(200).json(event);
    }catch (err) {
        if (err.message === 'Event not found') {
            return res.status(404).json({ message: 'Event not found' });
        }
        return res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};