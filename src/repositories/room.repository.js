import { getConnection } from "../config/db";

class RoomRepo {
    async createRoom(roomData) {
        try {
            let conn = await getConnection();
            const result = await conn.query(`
                INSERT INTO rooms ( building_name, room_number, capacity, start_time, end_time, is_available, type)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
                roomData.building_name,
                roomData.room_number,
                roomData.capacity,
                roomData.start_time,
                roomData.end_time,
                roomData.is_available,
                roomData.type
            ]);
            return result;
        } catch (error) {
            throw new Error('Error creating room: ' + error.message);
        } finally {
            if (conn) conn.end();
        }
    }

    async findRoom(room_number, building_name) {
        try {
            let conn = await getConnection();
            const rows = await conn.query(`
                SELECT * FROM rooms WHERE room_number = ? AND building_name = ?
            `, [room_number, building_name]);
            return rows[0];
        } catch (error) {
            return null;
        } finally {
            if (conn) conn.end();
        }
    }
}

export default new RoomRepo();