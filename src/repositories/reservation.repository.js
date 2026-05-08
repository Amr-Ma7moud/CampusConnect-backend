import { getConnection } from "../config/db.js";

class ReservationRepo {
    async getActiveRoomReservations(userId) {
        let conn;
        try {
            conn = await getConnection();
            const result = await conn.query(`
                SELECT 
                    srr.student_id,
                    srr.room_id,
                    srr.start_time,
                    srr.end_time,
                    srr.status,
                    r.room_number,
                    r.building_name
                FROM std_reserve_room srr
                JOIN rooms r ON srr.room_id = r.room_id
                WHERE srr.student_id = ? 
                AND srr.status = 'confirmed'
                AND srr.end_time > NOW()
                ORDER BY srr.start_time ASC
            `, [userId]);

            return result.map(res => ({
                room_id: res.room_id,
                room_name: `${res.building_name} - Room ${res.room_number}`,
                start_time: res.start_time,
                end_time: res.end_time,
                status: res.status
            }));
        } catch (error) {
            throw new Error('Error fetching room reservations: ' + error.message);
        } finally {
            if (conn) conn.release();
        }
    }

    async getActiveFacilityReservations(userId) {
        let conn;
        try {
            conn = await getConnection();
            const result = await conn.query(`
                SELECT 
                    srf.student_id,
                    srf.facility_id,
                    srf.reservation_start_date,
                    srf.reservation_end_date,
                    srf.status,
                    f.name,
                    f.type
                FROM std_reserve_facility srf
                JOIN facilities f ON srf.facility_id = f.facility_id
                WHERE srf.student_id = ? 
                AND srf.status = 'confirmed'
                AND srf.reservation_end_date > NOW()
                ORDER BY srf.reservation_start_date ASC
            `, [userId]);

            return result.map(res => ({
                facility_id: res.facility_id,
                facility_name: res.name,
                reservation_start_date: res.reservation_start_date,
                reservation_end_date: res.reservation_end_date,
                type: res.type,
                status: res.status
            }));
        } catch (error) {
            throw new Error('Error fetching facility reservations: ' + error.message);
        } finally {
            if (conn) conn.release();
        }
    }

    async getActiveEventRegistrations(userId) {
        let conn;
        try {
            conn = await getConnection();
            const result = await conn.query(`
                SELECT 
                    sre.student_id,
                    sre.event_id,
                    e.title,
                    e.event_start_date,
                    e.event_end_date,
                    e.type,
                    e.status
                FROM std_register_event sre
                JOIN events e ON sre.event_id = e.event_id
                WHERE sre.student_id = ? 
                AND e.status IN ('scheduled', 'ongoing')
                AND e.event_end_date > NOW()
                ORDER BY e.event_start_date ASC
            `, [userId]);

            return result.map(res => ({
                event_id: res.event_id,
                title: res.title,
                event_start_date: res.event_start_date,
                event_end_date: res.event_end_date,
                type: res.type,
                status: res.status
            }));
        } catch (error) {
            throw new Error('Error fetching event registrations: ' + error.message);
        } finally {
            if (conn) conn.release();
        }
    }
}

export default new ReservationRepo();
