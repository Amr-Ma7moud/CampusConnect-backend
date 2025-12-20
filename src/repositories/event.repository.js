import { getConnection } from "../config/db.js";
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
        try {
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
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.end();
        }
    }

    async getRegisteredStudentsForEvent(eventId) {
        let conn;
        try {
            conn = await getConnection();
            const [rows] = await conn.query(
                `
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
            `,
                [eventId]
            );
            return rows;
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.end();
        }
    }

    /**
     * takes eventId as parameter
     * returns true if event exists, false otherwise
     * throws error if any database issue occurs
     * @param {number} eventId
     * @return {boolean} event existence
     */
    async isEventExists(eventId) {
        let conn;
        try {
            conn = await getConnection();
            const [rows] = await conn.query(
                `
                SELECT 1 
                FROM events 
                WHERE event_id = ?;
            `,
                [eventId]
            );
            return rows.length > 0;
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.end();
        }
    }

    async getAttendeeListForEvent(eventId) {
        let conn;
        try {
            conn = await getConnection();
            const [rows] = await conn.query(
                `
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
                `,
                [eventId]
            );
            return rows;
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.end();
        }
    }

    async getAllClubEvents(club_manager_id) {
        let conn;
        try {
            conn = await getConnection();
            const [rows] = await conn.query(
                `
                SELECT 
                    e.event_id,
                    e.type,
                    e.title,
                    e.description,
                    e.event_start_date AS start_time,
                    e.event_end_date AS end_time,
                    e.status,
                    e.max_capacity AS max_regestrations
                FROM events e
                INNER JOIN clubs c ON e.club_id = c.club_id
                INNER JOIN club_manager cm ON c.club_id = cm.club_id
                WHERE cm.student_id = ?
                ORDER BY e.event_start_date DESC;
                `,
                [club_manager_id]
            );
            return rows;
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.end();
        }
    }

    async getApprovedEvents(type, clubId) {
        let conn;
        try {
            conn = await getConnection();
            const [rows] = await conn.query(
                `
                SELECT 
                    e.event_id,
                    c.name AS club_name,
                    c.logo AS club_logo_url,
                    c.cover AS club_cover_url,
                    e.title,
                    e.description,
                    e.event_start_date AS start_time,
                    e.event_end_date AS end_time,
                    CONCAT(r.building_name, ' - Room ', r.room_number) AS location,
                    COUNT(ser.student_id) AS regestrations,
                    e.max_capacity AS max_regestrations
                FROM events e
                INNER JOIN clubs c ON e.club_id = c.club_id
                LEFT JOIN rooms r ON e.room_id = r.room_id
                LEFT JOIN std_register_event ser ON e.event_id = ser.event_id
                WHERE e.club_id = ?
                    AND e.type = ?
                    AND e.status = 'scheduled'
                    AND c.status = 'active'
                GROUP BY e.event_id, c.name, c.logo, c.cover, e.title, e.description, 
                        e.event_start_date, e.event_end_date, r.building_name, r.room_number, e.max_capacity
                ORDER BY e.event_start_date ASC;
                `,
                [clubId, type]
            );
            return rows;
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.end();
        }
    }

    async deleteEvent(eventId) {
        let conn;
        try {
            conn = await getConnection();
            await conn.query(
                `
                DELETE FROM events
                WHERE event_id = ?;
                `,
                [eventId]
            );
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.end();
        }
    }

    async scheduleEvent(eventData) {
        let conn;
        try {
            conn = await getConnection();
            const [result] = await conn.query(
                `
                INSERT INTO events (
                    type, 
                    title, 
                    description, 
                    event_start_date, 
                    event_end_date, 
                    club_id,
                    room_id, 
                    max_capacity
                ) VALUES (?, ?, ?, ?, ?, ?, ?);
                `,
                [
                    eventData.type,
                    eventData.title,
                    eventData.description,
                    eventData.startTime,
                    eventData.endTime,
                    eventData.club_id,
                    eventData.roomId,
                    eventData.max_regestrations,
                ]
            );
            return result.insertId;
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.end();
        }
    }

    /**
     * Check if a student is already registered for an event
     * @param {number} eventId - The event ID to check
     * @param {number} studentId - The student ID to check
     * @returns {boolean} True if student is already registered, false otherwise
     * @throws {Error} Database connection or query error
     */
    async isStudentRegisteredForEvent(eventId, studentId) {
        let conn;
        try {
            conn = await getConnection();
            const [rows] = await conn.query(
                `SELECT 1 FROM std_register_event WHERE event_id = ? AND student_id = ?`,
                [eventId, studentId]
            );
            return rows.length > 0;
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.end();
        }
    }

    /**
     * Get current registration count for an event
     * @param {number} eventId - The event ID to check
     * @returns {number} Current number of registered students
     * @throws {Error} Database connection or query error
     */
    async getEventRegistrationCount(eventId) {
        let conn;
        try {
            conn = await getConnection();
            const [rows] = await conn.query(
                `SELECT COUNT(*) as count FROM std_register_event WHERE event_id = ?`,
                [eventId]
            );
            return rows[0].count;
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.end();
        }
    }

    /**
     * Get event status and timing information
     * @param {number} eventId - The event ID to check
     * @returns {object} Object containing status, start_date, end_date
     * @throws {Error} Database connection or query error
     */
    async getEventStatusAndTiming(eventId) {
        let conn;
        try {
            conn = await getConnection();
            const [rows] = await conn.query(
                `SELECT status, event_start_date, event_end_date 
                 FROM events WHERE event_id = ?`,
                [eventId]
            );
            return rows[0] || null;
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.end();
        }
    }

    /**
     * Get event capacity information
     * @param {number} eventId - The event ID to check
     * @returns {object} Object containing max_capacity
     * @throws {Error} Database connection or query error
     */
    async getEventCapacity(eventId) {
        let conn;
        try {
            conn = await getConnection();
            const [rows] = await conn.query(
                `SELECT max_capacity FROM events WHERE event_id = ?`,
                [eventId]
            );
            return rows[0] || null;
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.end();
        }
    }

    /**
     * Register a student for an event
     * @param {number} eventId - The event ID to register for
     * @param {number} studentId - The student ID to register
     * @returns {number} The insertion ID from the database
     * @throws {Error} Database connection or query error
     */
    async registerStudentForEvent(eventId, studentId) {
        let conn;
        try {
            conn = await getConnection();
            const [result] = await conn.query(
                `INSERT INTO std_register_event (event_id, student_id, registration_date) 
                 VALUES (?, ?, NOW())`,
                [eventId, studentId]
            );
            return result.insertId;
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.end();
        }
    }

    /**
     * Cancel a student's registration for an event
     * @param {number} eventId - The event ID to cancel registration for
     * @param {number} studentId - The student ID to cancel registration for
     * @returns {boolean} True if registration was successfully cancelled, false if not found
     * @throws {Error} Database connection or query error
     */
    async cancelStudentRegistration(eventId, studentId) {
        let conn;
        try {
            conn = await getConnection();
            const [result] = await conn.query(
                `
                DELETE FROM std_register_event 
                WHERE event_id = ? AND student_id = ?`,
                [eventId, studentId]
            );
            return result.affectedRows > 0;
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.end();
        }
    }

    async isStudentCheckedIn(eventId, studentId) {
        let conn;
        try {
            conn = await getConnection();
            const [rows] = await conn.query(
                `SELECT 1 FROM std_attend_event WHERE event_id = ? AND student_id = ?`,
                [eventId, studentId]
            );
            return rows.length > 0;
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.end();
        }
    }

    async checkInStudent(eventId, studentId) {
        let conn;
        try {
            conn = await getConnection();
            const [result] = await conn.query(
                `INSERT INTO std_attend_event (event_id, student_id, attend_date) 
                VALUES (?, ?, NOW())`,
                [eventId, studentId]
            );
            return result.insertId;
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.end();
        }
    }

    async reportEventIssue(reportData) {
        let conn;
        try {
            conn = await getConnection();
            const result = await conn.query(`
                INSERT INTO std_report_event ( student_id, event_id, reason, details)
                VALUES (?, ?, ?, ?)
                `,reportData);
            return result;
        }catch (error) {
            console.log(error);
            throw new Error('Error reporting facility issue: ' + error.message);
        }finally {
            if (conn) conn.end();
        }
    }
}

export default new EventRepo();
