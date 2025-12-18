import { getConnection } from "../config/db";
class EventRepo {

    /** 
    * takes eventId as parameter
    * returns event details from the database
    * throws error if any database issue occurs
    * @param {number} eventId
    * @return {object} event details 
    */
    async getEventById(eventId) {
        let conn;
        try{
            conn = await getConnection();
            const [row] = await conn.query(
                `
                SELECT 
                e.event_id,
                c.name AS club_name,
                c.logo AS club_logo_url,
                c.cover AS club_cover_url,
                e.type,
                e.title,
                e.description,
                e.event_start_date AS start_time,
                e.event_end_date AS end_time,
                CONCAT(r.building_name, ' - Room ', r.room_number) AS location,
                COUNT(ser.student_id) AS regestrations,
                e.max_capacity AS max_regestrations
                FROM events e
                LEFT JOIN clubs c ON e.club_id = c.club_id
                LEFT JOIN rooms r ON e.room_id = r.room_id
                LEFT JOIN std_register_event ser ON e.event_id = ser.event_id
                WHERE e.event_id = ?
                GROUP BY e.event_id, c.name, c.logo, c.cover, e.type, e.title, e.description, 
                    e.event_start_date, e.event_end_date, r.building_name, r.room_number, e.max_capacity;
                `,
                [eventId]
            );
            return row;
        }catch(err){
            throw err; 
        }finally{
            if(conn) conn.end();
        }
    }

    async getRegisteredStudentsForEvent(eventId) {
        let conn;
        try {
            conn = await getConnection();
            const [rows] = await conn.query(`
                SELECT 
                    s.student_id,
                    CONCAT(u.first_name, ' ', u.last_name) AS name,
                    u.email,
                    s.major
                FROM std_register_event sre
                INNER JOIN students s ON sre.student_id = s.student_id
                INNER JOIN users u ON s.student_id = u.user_id
                WHERE sre.event_id = ?
                    AND u.role = 'student' 
                    AND u.is_active = TRUE;
            `, [eventId]);
            return rows;
        }catch(err){
            throw err; 
        }finally{
            if(conn) conn.end();
        }
    }

    async isEventExists(eventId) {
        let conn;
        try {
            conn = await getConnection();
            const [rows] = await conn.query(`
                SELECT 1 
                FROM events 
                WHERE event_id = ?;
            `, [eventId]);
            return rows.length > 0;
        }catch(err){
            throw err; 
        }finally{
            if(conn) conn.end();
        }
    }

    async getAttendeeListForEvent(eventId) {
        let conn;
        try {
            conn = await getConnection();
            const [rows] = await conn.query(`
                SELECT 
                    s.student_id,
                    CONCAT(u.first_name, ' ', u.last_name) AS name,
                    u.email,
                    s.major
                FROM std_attend_event sae
                INNER JOIN students s ON sae.student_id = s.student_id
                INNER JOIN users u ON s.student_id = u.user_id
                WHERE sae.event_id = ?
                    AND u.role = 'student' 
                    AND u.is_active = TRUE;
                `,[eventId]);
            return rows;
        }catch(err){
            throw err; 
        }finally{
            if(conn) conn.end();
        }
    };
}

export default new EventRepo();