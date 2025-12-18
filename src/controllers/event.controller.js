import EventService from '../services/event.service.js';
export const getEventById = async (req, res) => {
    const id  = req.params.event_id;
    try {
        checkId(id);
        const event = await EventService.getEventById(id);
        return res.status(200).json(event);
    }catch (err) {
        if (err.message === 'Event not found') {
            return res.status(404).json({ message: 'Event not found' });
        }
        if (err.message === 'Invalid event ID') {
            return res.status(400).json({ message: 'Invalid event ID' });
        }
        return res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

export const getRegisteredStudentsForEvent = async (req, res) => {
    const id  = req.params.id;
    checkId(id);
    try {
        const students = await EventService.getRegisteredStudentsForEvent(id);
        return res.status(200).json(students);
    } catch (err) {
        if (err.message === 'Event not found') {
            return res.status(404).json({ message: 'Event not found' });
        }
        if (err.message === 'Invalid event ID') {
            return res.status(400).json({ message: 'Invalid event ID' });
        }
        return res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

export const getAttendeeListForEvent = async (req, res) => {
    const id  = req.params.id;
    checkId(id);
    try {
        const attendees = await EventService.getAttendeeListForEvent(id);
        return res.status(200).json(attendees);
    } catch (err) {
        if (err.message === 'Event not found') {
            return res.status(404).json({ message: 'Event not found' });
        }
        if (err.message === 'Invalid event ID') {
            return res.status(400).json({ message: 'Invalid event ID' });
        }
        return res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

const checkId = (id) => {
    if (!id || isNaN(id) || id <= 0)
        throw new Error('Invalid event ID');
}