import { getConnection } from "../config/db.js";
class EventRepo {
    /**
     * takes eventId as parameter
     * returns event details from the database
     * throws error if any database issue occurs
     * @param {number} eventId
     * @return {object} event details
     */
    async getEventById(eventId, currentUserId = null) {
        let conn;
        try {
            conn = await getConnection();
            const params = [eventId];
            let registrationJoin = "";
            let registrationSelect = "0 AS is_registered";

            if (currentUserId) {
                registrationJoin = `
                LEFT JOIN std_register_event cur_ser
                    ON e.event_id = cur_ser.event_id AND cur_ser.student_id = ?
                `;
                registrationSelect = `
                MAX(CASE WHEN cur_ser.student_id IS NOT NULL THEN 1 ELSE 0 END) AS is_registered
                `;
                params.unshift(currentUserId);
            }

            const rows = await conn.query(
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
                e.max_capacity AS max_regestrations,
                ${registrationSelect}
                FROM events e
                LEFT JOIN clubs c ON e.club_id = c.club_id
                LEFT JOIN rooms r ON e.room_id = r.room_id
                LEFT JOIN std_register_event ser ON e.event_id = ser.event_id
                ${registrationJoin}
                WHERE e.event_id = ?
                GROUP BY e.event_id, c.name, c.logo, c.cover, e.type, e.title, e.description, 
                    e.event_start_date, e.event_end_date, r.building_name, r.room_number, e.max_capacity;
                `,
                params
            );
            return rows[0];
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }

    async getRegisteredStudentsForEvent(eventId) {
        let conn;
        try {
            conn = await getConnection();
            const rows = await conn.query(
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
            if (conn) conn.release();
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
            const rows = await conn.query(
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
            if (conn) conn.release();
        }
    }

    async getAttendeeListForEvent(eventId) {
        let conn;
        try {
            conn = await getConnection();
            const rows = await conn.query(
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
            if (conn) conn.release();
        }
    }

    async getAllClubEvents(club_manager_id) {
        let conn;
        try {
            conn = await getConnection();
            const rows = await conn.query(
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
            if (conn) conn.release();
        }
    }

    async getApprovedEvents({ type, clubId, currentUserId } = {}) {
        let conn;
        try {
            conn = await getConnection();
            const params = [];
            let filters = `
                    e.status = 'scheduled'
                    AND c.status = 'active'
            `;
            let registrationJoin = "";
            let registrationSelect = "0 AS is_registered";

            if (currentUserId) {
                registrationJoin = `
                LEFT JOIN std_register_event cur_ser
                    ON e.event_id = cur_ser.event_id AND cur_ser.student_id = ?
                `;
                registrationSelect = `
                MAX(CASE WHEN cur_ser.student_id IS NOT NULL THEN 1 ELSE 0 END) AS is_registered
                `;
                params.push(currentUserId);
            }

            if (type) {
                filters += `
                    AND e.type = ?
                `;
                params.push(type);
            }

            if (clubId) {
                filters += `
                    AND e.club_id = ?
                `;
                params.push(clubId);
            }

            const rows = await conn.query(
                `
                SELECT 
                    e.event_id,
                    e.type,
                    c.name AS club_name,
                    c.logo AS club_logo_url,
                    c.cover AS club_cover_url,
                    e.title,
                    e.description,
                    e.event_start_date AS start_time,
                    e.event_end_date AS end_time,
                    CONCAT(r.building_name, ' - Room ', r.room_number) AS location,
                    COUNT(ser.student_id) AS regestrations,
                    e.max_capacity AS max_regestrations,
                    ${registrationSelect}
                FROM events e
                INNER JOIN clubs c ON e.club_id = c.club_id
                LEFT JOIN rooms r ON e.room_id = r.room_id
                LEFT JOIN std_register_event ser ON e.event_id = ser.event_id
                ${registrationJoin}
                WHERE ${filters}
                GROUP BY e.event_id, e.type, c.name, c.logo, c.cover, e.title, e.description, 
                        e.event_start_date, e.event_end_date, r.building_name, r.room_number, e.max_capacity
                ORDER BY e.event_start_date ASC;
                `,
                params
            );
            return rows;
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
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
            if (conn) conn.release();
        }
    }

    async scheduleEvent(eventData) {
        let conn;
        try {
            conn = await getConnection();
            const result = await conn.query(
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
            if (conn) conn.release();
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
            const rows = await conn.query(
                `SELECT 1 FROM std_register_event WHERE event_id = ? AND student_id = ?`,
                [eventId, studentId]
            );
            return rows.length > 0;
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
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
            const rows = await conn.query(
                `SELECT COUNT(*) as count FROM std_register_event WHERE event_id = ?`,
                [eventId]
            );
            return rows[0].count;
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
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
            const rows = await conn.query(
                `SELECT status, event_start_date, event_end_date 
                 FROM events WHERE event_id = ?`,
                [eventId]
            );
            return rows[0] || null;
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
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
            const rows = await conn.query(
                `SELECT max_capacity FROM events WHERE event_id = ?`,
                [eventId]
            );
            return rows[0] || null;
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
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
            const result = await conn.query(
                `INSERT INTO std_register_event (event_id, student_id) 
                 VALUES (?, ?)`,
                [eventId, studentId]
            );
            return result.insertId;
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
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
            const result = await conn.query(
                `
                DELETE FROM std_register_event 
                WHERE event_id = ? AND student_id = ?`,
                [eventId, studentId]
            );
            return result.affectedRows > 0;
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }

    async isStudentCheckedIn(eventId, studentId) {
        let conn;
        try {
            conn = await getConnection();
            const rows = await conn.query(
                `SELECT 1 FROM std_attend_event WHERE event_id = ? AND student_id = ?`,
                [eventId, studentId]
            );
            return rows.length > 0;
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }

    async checkInStudent(eventId, studentId) {
        let conn;
        try {
            conn = await getConnection();
            const result = await conn.query(
                `INSERT INTO std_attend_event (event_id, student_id, attend_date) 
                VALUES (?, ?, NOW())`,
                [eventId, studentId]
            );
            return result.insertId;
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
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
            if (conn) conn.release();
        }
    }

    async getAllReports() {
        let conn;
        try {
            conn = await getConnection();
            const rows = await conn.query(`
                SELECT * FROM std_report_event
            `);
            
            return rows;
        }catch (error) {
            console.log(error);
            throw new Error('Error getting reports: ' + error.message);
        }finally {
            if (conn) conn.release();
        }
    }

    async getAllEvents() {
        return await this.getApprovedEvents({});
    }

    async getAttendanceForAllEvents() {
        let conn;
        try {
            conn = await getConnection();

            const result = await conn.query(`
                    SELECT 
                        DATE_FORMAT(e.event_start_date, '%b') AS month,
                        SUM(CASE WHEN e.type = 'event' THEN 1 ELSE 0 END) AS events,
                        SUM(CASE WHEN e.type = 'session' THEN 1 ELSE 0 END) AS sessions
                    FROM std_attend_event sa
                    JOIN events e ON sa.event_id = e.event_id
                    WHERE e.event_start_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
                    GROUP BY DATE_FORMAT(e.event_start_date, '%Y-%m'), month
                    ORDER BY DATE_FORMAT(e.event_start_date, '%Y-%m')
            `);

            return result;
        } catch (error) {
            console.log(error);
            throw new Error('Error getting attendance overview: ' + error.message);
        }finally {
            if (conn) conn.release();
        }
    }

    async getAllPendingEvents() {
        let conn;
        try {
            conn = await getConnection();

            const events = await conn.query(`
                SELECT 
                    e.event_id,
                    e.type, 
                    e.title, 
                    e.description, 
                    e.event_start_date, 
                    e.event_end_date,
                    e.max_capacity,
                    c.name,
                    c.logo
                FROM events e
                JOIN clubs c ON e.club_id = c.club_id
                WHERE e.status = 'pending'
            `);

            return events;
        } catch (error) {
            console.log(error);
            throw new Error('Error getting pending events: ' + error.message);
        } finally {
            if (conn) conn.release();
        }
    }

    async assignRoomToEvent(eventId, roomId){ 
        let conn;
        try {
            conn = await getConnection();
            
            await conn.query(`
                UPDATE events
                SET room_id = ?
                WHERE event_id = ?
            `, [roomId, eventId]);
        } catch (error) {
            console.log(error);
            throw new Error ('Error assigning room to event', error.message);
        } finally {
            if (conn) conn.release();
        }
    }

    async updateEventStatus(eventId, status) {
        let conn;
        try {
            conn = await getConnection();
            
            await conn.query(`
                UPDATE events
                SET status = ?
                WHERE event_id = ?
            `, [status, eventId]);
        } catch (error) {
            console.log(error);
            throw new Error ('Error assigning room to event', error.message);
        } finally {
            if (conn) conn.release();
        }
    }
}

export default new EventRepo();
