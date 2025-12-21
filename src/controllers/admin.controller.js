import adminService from "../services/admin.service";
import eventService from "../services/event.service";


export const getReports = async (req, res) => {
    try {
        const reports = await adminService.getAllReports();
        res.status(200).json(reports);
    } catch(err) {
        res.status(500).json({ message: 'Error getting reports: ' + err.message });
    }
};

export const getStats = async (req, res) => {
    try {
        const stats = await adminService.getStats();
        res.status(200).json(stats);
    } catch (err) { 
        res.status(500).json({ message: 'Error getting stats: ' + err.message });
    }
};

export const getAttendaceOverview = async (req, res) => {
    try {
        const attendance = await adminService.getAttendanceOverview();
        res.status(200).json(attendance);
    } catch (err) {
        res.status(500).json({ message: 'Error getting attendance: ' + err.message });
    }
};

export const listPendingEvents = async (req, res) => {
    try {
        const pendingEvents = await adminService.getPendingEvents();

        res.status(200).json(pendingEvents);
    } catch {
        res.status(500).json({ message: 'Error listing pending events: ' + err.message });
    }
};

export const approveEvent = async (req, res) => {
    try {
        const { status, room_id } = req.body;
        const eventId = req.params.id;

        if(status == "approved" && !room_id) {
            return res.status(404).json({
                message: "room not found",
                details: "Cannot approve event without a reserved room"
            });
        }

        if(!await eventService.getEventById(eventId)) {
            return res.status(404).json({
                message: "event not found",
                details: "Cannot approve not existed event"
            });
        }

        await adminService.approveEvent(eventId, status, room_id);

        res.status(200).json({ message: `Event has been ${status} successfully` });
    } catch(err) {
        res.status(500).json({ message: 'Error approving event: ' + err.message });
    }
}