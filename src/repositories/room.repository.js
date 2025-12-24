import { getConnection } from "../config/db.js";

class RoomRepo {
    async createRoom(roomData) {
        let conn;
        try {
            conn = await getConnection();
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
            return result.insertId;
        } catch (error) {
            throw new Error('Error creating room: ' + error.message);
        } finally {
            if (conn) conn.release();
        }
    }

    async addResourceToRoom(roomId, resourceId) {
        let conn;
        try {
            conn = await getConnection();

            const result = await conn.query(`
                INSERT INTO room_has_resources (room_id, resource_id)  
                VALUES (?, ?)  
            `, [roomId, resourceId]);

            return result;
        } catch(error) {
            throw new Error('Error adding resource at room: ' + error.message);
        } finally {
            if(conn) conn.end();
        }
    }

    async findRoom(room_number, building_name) {
        let conn;
        try {
            conn = await getConnection();
            const rows = await conn.query(`
                SELECT * FROM rooms WHERE room_number = ? AND building_name = ?
            `, [room_number, building_name]);
            return rows[0][0];
        } catch (error) {
            return null;
        } finally {
            if (conn) conn.release();
        }
    }

    async getAllRooms() {
        let conn;
        try {
            conn = await getConnection();
            const rows = await conn.query(`
                SELECT r.*, GROUP_CONCAT(res.name) as resources 
                FROM rooms r 
                LEFT JOIN room_has_resources rhr ON r.room_id = rhr.room_id 
                LEFT JOIN resources res ON rhr.resource_id = res.resource_id 
                GROUP BY r.room_id
            `);            
            console.log('RoomRepo rows:', JSON.stringify(rows, null, 2));
            return rows;
        } catch (error) {
            return null;
        } finally {
            if (conn) conn.release();
        }
    }

    async getAllRoomsReservations() {
        let conn;
        try {
            conn = await getConnection();
            const rows = await conn.query(`SELECT * FROM std_reserve_room`);
            return rows;
        } catch (error) {
            return null;
        } finally {
            if (conn) conn.release();
        }
    }

    async createResource(name) {
        let conn;
        try {
            conn = await getConnection();
            const result = await conn.query(`INSERT INTO resources (name) VALUES (?)`, [name]);
            return result.insertId;
        } catch (error) {
            throw new Error('Error creating resource: ' + error.message);
        } finally {
            if (conn) conn.release();
        }
    }

    async getAllResources() {
        let conn;
        try {
            conn = await getConnection();
            const rows = await conn.query(`SELECT * FROM resources`);
            return rows;
        } catch (error) {
            throw new Error('Error getting resources: ' + error.message);
        } finally {
            if (conn) conn.release();
        }
    }

    async reserveRoom(studentId, roomId, start_time, end_time, purpose) {
        let conn;
        try {
            conn = await getConnection();
            const result = await conn.query(`
                INSERT INTO std_reserve_room ( student_id, room_id, start_time, end_time, purpose, status)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [
                studentId,
                roomId,
                start_time,
                end_time,
                purpose,
                'confirmed'
            ]);
            return result;
        } catch (error) {
            throw new Error('Error reserving room: ' + error.message);
        } finally {
            if (conn) conn.release();
        }
    }

    async cancelReservation(studentId, roomId, start_time) {
        let conn;
        try {
            conn = await getConnection();
            const result = await conn.query(`
                UPDATE std_reserve_room
                SET status = 'cancelled'
                WHERE student_id = ? AND room_id = ? AND start_time = ?
            `, [
                studentId,
                roomId,
                start_time
            ]);
            return result;
        } catch (error) {
            throw new Error('Error cancelling reservation: ' + error.message);
        } finally {
            if (conn) conn.release();
        }
    }

    async getReservation(studentId, roomId, start_time) {
        let conn;
        try {
            conn = await getConnection();
            const rows = await conn.query(`
                SELECT * FROM std_reserve_room
                WHERE student_id = ? AND room_id = ? AND start_time = ?
            `, [
                studentId,
                roomId,
                start_time
            ]);
            return rows[0][0];
        } catch (error) {
            return null;
        } finally {
            if (conn) conn.release();
        }
    }

    async reportRoomIssue(reportData) {
        let conn;
        try {
            conn = await getConnection();
            const result = await conn.query(`
                INSERT INTO std_report_room ( student_id, room_id, reason, details)
                VALUES (?, ?, ?, ?)
                `, reportData);
            return result;
        }catch (error) {
            console.log(error);
            throw new Error('Error reporting facility issue: ' + error.message);
        }finally {
            if (conn) conn.release();
        }
    }

    async getAllReports() {
        let conn;
        try {
            conn = await getConnection();
            const rows = await conn.query(`
                SELECT * FROM std_report_room
            `);
            
            return rows;
        }catch (error) {
            console.log(error);
            throw new Error('Error getting reports: ' + error.message);
        }finally {
            if (conn) conn.release();
        }
    }
}

export default new RoomRepo();