import RoomService from "../services/room.service.js";
import { saveLog } from "../utils/logs.js";

export const createRoom = async (req, res) => {
    let { room_number, building_name, start_time, end_time, capacity, type, is_available, resources_ids } = req.body;
    try {
        if (!room_number || !building_name || !capacity || !type)
            return res.status(400).json({ message: 'Missing required fields' });

        if (!start_time)
            start_time = 4;

        if (!end_time)
            end_time = 10;

        // Default values for testing
        if (!is_available)
            is_available = true;

        await RoomService.createRoom({ room_number, building_name, start_time, end_time, capacity, type, is_available, resources_ids });

        await saveLog({
            ip_address: req.ip,
            user_type: 'admin', // Assuming admin creates rooms
            record_id: room_number.toString(), // Room number as ID or should I get the ID? Service doesn't return ID here.
            edited_table: 'rooms',
            action: 'create',
            changed_by: req.user ? req.user.id.toString() : 'admin'
        });

        return res.status(200).json({ message: 'Room created successfully' });
    } catch (err) {
        console.error('Error creating room:', err);
        return res.status(500).json({ message: 'Server error: ' + err.message });
    }
}


export const reserveRoom = async (req, res) => {
    const userId = req.user.id;
    const { start_time, end_time, purpose, std_ids } = req.body;

    try {
        if (!start_time || !end_time || !purpose || !std_ids || !Array.isArray(std_ids) || std_ids.length === 0) {
            return res.status(400).json({ message: 'Missing or invalid required fields' });
        }

        const reservedRoom = await RoomService.resreveRoom(start_time, end_time, purpose, std_ids);

        if (reservedRoom) {
            await saveLog({
                ip_address: req.ip,
                user_type: 'student', // or user
                record_id: reservedRoom.room_id.toString() || 'unknown', // Assuming reservedRoom has ID
                edited_table: 'std_reserve_room',
                action: 'reserve',
                changed_by: userId.toString()
            });
            return res.status(200).json(reservedRoom);
        } else {
            return res.status(404).json({ message: 'No available room found for the given time slot' });
        }

    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
};

export const cancelReservation = async (req, res) => {
    const roomId = req.params.id;
    const userId = req.user.id;
    const start_time = req.body.start_time;

    if (!start_time) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {

        const result = await RoomService.cancelReservation(userId, roomId, start_time);
        if (result.success) {
            await saveLog({
                ip_address: req.ip,
                user_type: 'student',
                record_id: roomId.toString(),
                edited_table: 'std_reserve_room',
                action: 'cancel_reservation',
                changed_by: userId.toString()
            });
            return res.status(200).json({ message: 'Reservation cancelled successfully' });
        } else {
            return res.status(404).json({ message: result.message });
        }

    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
};

export const getAllRooms = async (req, res) => {
    try {
        const rooms = await RoomService.getAllRooms();
        console.log('Sending rooms:', JSON.stringify(rooms, null, 2));
        return res.status(200).json(rooms);
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
};

export const reportRoomIssue = async (req, res) => {
    const { room_id, reason, details } = req.body;
    const userId = req.user.id;

    try {
        if (!room_id || !reason || !details) {
            return res.status(400).json({
                message: 'Missing required fields',
                details: 'room_id, reason, and details are required.'
            });
        }

        await RoomService.reportRoomIssue(userId, room_id, reason, details);

        await saveLog({
            ip_address: req.ip,
            user_type: 'student',
            record_id: room_id.toString(),
            edited_table: 'std_report_room',
            action: 'report_issue',
            changed_by: userId.toString()
        });

        return res.status(200).json({ message: 'Room issue reported successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error reporting room issue: ' + err.message });
    }
};

export const createResource = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: 'Resource name is required' });

        const resourceId = await RoomService.createResource(name);

        await saveLog({
            ip_address: req.ip,
            user_type: 'admin',
            record_id: resourceId.toString(),
            edited_table: 'resources',
            action: 'create',
            changed_by: req.user ? req.user.id.toString() : 'admin'
        });

        return res.status(201).json({ message: 'Resource created successfully', resourceId: resourceId.toString() });
    } catch (err) {
        return res.status(500).json({ message: 'Error creating resource: ' + err.message });
    }
};

export const getAllResources = async (req, res) => {
    try {
        const resources = await RoomService.getAllResources();
        return res.status(200).json(resources);
    } catch (err) {
        return res.status(500).json({ message: 'Error fetching resources: ' + err.message });
    }
};