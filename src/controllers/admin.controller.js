import adminService from "../services/admin.service.js";
import eventService from "../services/event.service.js";
import { saveLog } from "../utils/logs.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOGS_FILE_PATH = path.join(__dirname, '../../logs.json');


export const getReports = async (req, res) => {
    try {
        const reports = await adminService.getAllReports();
        res.status(200).json(reports);
    } catch (err) {
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
        console.log("Hello from admin get pending events (controller)");

        const pendingEvents = await adminService.getPendingEvents();

        res.status(200).json(pendingEvents);
    } catch (err) {
        res.status(500).json({ message: 'Error listing pending events: ' + err.message });
    }
};

export const approveEvent = async (req, res) => {
    try {
        const { status, room_id } = req.body;
        const eventId = req.params.id;

        if (status == "approved" && !room_id) {
            return res.status(404).json({
                message: "room not found",
                details: "Cannot approve event without a reserved room"
            });
        }

        if (!await eventService.getEventById(eventId)) {
            return res.status(404).json({
                message: "event not found",
                details: "Cannot approve not existed event"
            });
        }

        await adminService.approveEvent(eventId, status, room_id);

        await saveLog({
            ip_address: req.ip,
            user_type: 'admin',
            record_id: eventId,
            edited_table: 'events',
            action: status, // 'approved' or 'rejected'
            changed_by: req.user ? req.user.id.toString() : 'admin'
        });

        res.status(200).json({ message: `Event has been ${status} successfully` });
    } catch (err) {
        res.status(500).json({ message: 'Error approving event: ' + err.message });
    }
}

export const getLogs = async (req, res) => {
    try {
        if (fs.existsSync(LOGS_FILE_PATH)) {
            const fileContent = await fs.promises.readFile(LOGS_FILE_PATH, 'utf-8');
            const logs = JSON.parse(fileContent);
            res.status(200).json(logs);
        } else {
            res.status(200).json([]);
        }
    } catch (err) {
        res.status(500).json({ message: 'Error reading logs: ' + err.message });
    }
};