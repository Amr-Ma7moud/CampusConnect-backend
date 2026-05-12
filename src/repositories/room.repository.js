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
//bug 3 fixed changed conn.end to conn.realse
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
            if(conn) conn.release();
        }
    }
//second bug fixed
    async findRoom(room_number, building_name) {
        let conn;
        try {
            conn = await getConnection();
            const [rows] = await conn.query(`
                SELECT * FROM rooms WHERE room_number = ? AND building_name = ?
            `, [room_number, building_name]);
        return (rows && rows.length > 0) ? rows[0] : null;
        } catch (error) {
            return null;
        } finally {
            if (conn) conn.release();
        }
    }
    async findRoomById(roomId) {
        let conn;
        try{
            conn = await getConnection();
            const rows = await conn.query( `
                SELECT * FROM rooms 
                WHERE room_id = ?
            `, [roomId]);
            return (rows && rows.length > 0) ? rows[0] : null;
        }catch(error ){
            return null;
        }finally{
            if(conn) conn.release();
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
//second bug fixed

    async getReservation(studentId, roomId, start_time) {
        let conn;
        try {
            conn = await getConnection();
            const [rows] = await conn.query(`
                SELECT * FROM std_reserve_room
                WHERE student_id = ? AND room_id = ? AND start_time = ?
            `, [
                studentId,
                roomId,
                start_time
            ]);
            return (rows && rows.length > 0) ? rows[0] : null ;
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

    async getCompletedReservationsCount() {
        let conn;
        try {
            conn = await getConnection();
            const rows = await conn.query(`
                SELECT COUNT(*) AS count
                FROM std_reserve_room
                WHERE status = 'completed'
            `);

            return Number(rows[0].count);
        } catch (error) {
            console.log(error);
            throw new Error('Error getting completed room reservations count: ' + error.message);
        } finally {
            if (conn) conn.release();
        }
    }

    async checkStudentsExist(studentIds) {
        let conn;
        try {
            conn = await getConnection();
            const placeholders = studentIds.map(() => '?').join(',');
            const rows = await conn.query(`
                SELECT student_id FROM students WHERE student_id IN (${placeholders})
            `, studentIds);
            
            const foundIds = rows.map(row => row.student_id);
            const missingIds = studentIds.filter(id => !foundIds.includes(id));
            
            return {
                allExist: missingIds.length === 0,
                missingIds: missingIds
            };
        } catch (error) {
            throw new Error('Error checking students: ' + error.message);
        } finally {
            if (conn) conn.release();
        }
    }

    async updateRoom (roomId,{room_number, building_name, start_time, end_time, capacity, type, is_available, resources_ids}){
    let conn;
    try{
       conn = await getConnection();
            const fields = [];
            const values = [];
            if(room_number){
                fields.push("room_number = ?");
                values.push(room_number);
            }
            if(building_name){
                fields.push("building_name = ?");
                values.push(building_name);
            }
            if(start_time){
                fields.push("start_time = ?");
                values.push(start_time);
            }
            if(end_time){
                fields.push("end_time = ?");
                values.push(end_time);
            }
            if(capacity){
                fields.push("capacity = ?");
                values.push(capacity);
            }
            if(type){
                fields.push("type = ?");
                values.push(type);
            }
            if(is_available !== undefined){
                fields.push("is_available = ?");
                values.push(is_available);
            }
            if(resources_ids){
                fields.push("resources_ids = ?");
                values.push(resources_ids.join(','));
            }

            if(fields.length === 0){
                return;
            }
            
            values.push(roomId); 
            const sql = `UPDATE rooms SET ${fields.join(', ')} WHERE id = ?`;
            await conn.query(sql, values);

    }catch (error) {
        console.log(error);
        throw new Error('Error updating room: ' + error.message);
    }finally{
        if(conn) conn.release();
    }
}

}

export default new RoomRepo();
