import { getConnection } from "../config/db.js";

export class FacilityRepo{

    /**
     * takes only one object as parameter
     * @param {Array} facilityData
     * with these properties:
     * name, location_description, min_capacity, max_capacity, type, status
     */
    async createFacility(facilityData) {
        let conn;
        try {
            conn = await getConnection();
            const result = await conn.query(`
                INSERT INTO facilities ( name, location_description, min_capacity, max_capacity, type, status)
                VALUES (?, ?, ?, ?, ?, ?)
                `,facilityData);
            return result;
        }catch (error) {
            console.log(error);
            throw new Error('Error creating facility: ' + error.message);
        }finally {
            if (conn) conn.release();
        }
    }

    async getFacilities() {
        let conn;
        try {
            conn = await getConnection();
            const rows = await conn.query(`
                SELECT 
                    facility_id,
                    name,
                    type,
                    location_description,
                    min_capacity,
                    max_capacity,
                    status
                FROM facilities
            `);
            
            return rows;
        }catch (error) {
            console.log(error);
            throw new Error('Error getting facilities: ' + error.message);
        }finally {
            if (conn) conn.release();
        }
    }

    async getFacilityById(facilityId) {
        let conn;
        try {
            conn = await getConnection();
            const rows = await conn.query(
                `
                SELECT
                    facility_id,
                    name,
                    type,
                    location_description,
                    min_capacity,
                    max_capacity,
                    status
                FROM facilities
                WHERE facility_id = ?
                `,
                [facilityId]
            );

            return rows[0];
        } catch (error) {
            console.log(error);
            throw new Error('Error getting facility: ' + error.message);
        } finally {
            if (conn) conn.release();
        }
    }

    async hasOverlappingReservation(facilityId, startTime, endTime) {
        let conn;
        try {
            conn = await getConnection();
            const rows = await conn.query(
                `
                SELECT 1
                FROM std_reserve_facility
                WHERE facility_id = ?
                    AND status NOT IN ('cancelled', 'completed')
                    AND reservation_start_date < ?
                    AND reservation_end_date > ?
                LIMIT 1
                `,
                [facilityId, endTime, startTime]
            );

            return rows.length > 0;
        } catch (error) {
            console.log(error);
            throw new Error('Error checking facility reservation overlap: ' + error.message);
        } finally {
            if (conn) conn.release();
        }
    }

    async reserveFacility(teamIds, facilityId, startTime, endTime, status = 'confirmed') {
        let conn;
        try {
            conn = await getConnection();
            await conn.beginTransaction();

            for (const studentId of teamIds) {
                await conn.query(
                    `
                    INSERT INTO std_reserve_facility (
                        student_id,
                        facility_id,
                        reservation_start_date,
                        reservation_end_date,
                        status
                    ) VALUES (?, ?, ?, ?, ?)
                    `,
                    [studentId, facilityId, startTime, endTime, status]
                );
            }

            await conn.commit();
            return {
                facility_id: facilityId,
                team_size: teamIds.length,
                start_time: startTime,
                end_time: endTime,
                status,
            };
        } catch (error) {
            if (conn) {
                await conn.rollback();
            }
            console.log(error);
            throw new Error('Error reserving facility: ' + error.message);
        } finally {
            if (conn) conn.release();
        }
    }

    async reportFacilityIssue(reportData) {
        let conn;
        try {
            conn = await getConnection();
            const result = await conn.query(`
                INSERT INTO std_report_facility ( student_id, facility_id, reason, details)
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
                SELECT * FROM std_report_facility
            `);
            
            return rows;
        }catch (error) {
            console.log(error);
            throw new Error('Error getting reports: ' + error.message);
        }finally {
            if (conn) conn.release();
        }
    }

    async getCompletedReservationsCountByType(type) {
        let conn;
        try {
            conn = await getConnection();
            const rows = await conn.query(
                `
                SELECT COUNT(*) AS count
                FROM std_reserve_facility srf
                JOIN facilities f ON srf.facility_id = f.facility_id
                WHERE srf.status = 'completed'
                    AND f.type = ?
                `,
                [type]
            );

            return Number(rows[0].count);
        } catch (error) {
            console.log(error);
            throw new Error('Error getting completed facility reservations count: ' + error.message);
        } finally {
            if (conn) conn.release();
        }
    }

    async updateFacility(facilityId,{name, location, min_capacity, max_capacity, type, status }){

        let conn;
        try{
            conn = await getConnection();
            const fields = [];
            const values = [];
            if(name){
                fields.push("name = ?");
                values.push(name);

            }
            if(location){
                fields.push("location_description = ?");
                values.push(location);
            }
            if(min_capacity !== undefined){
                fields.push("min_capacity = ?");
                values.push(min_capacity);
            }
            if(max_capacity !== undefined){
                fields.push("max_capacity = ?");
                values.push(max_capacity);
            }
            if(type !== undefined){
                fields.push("type = ?");
                values.push(type);
            }
            if(status !== undefined){
                fields.push("status = ?");
                values.push(status);
            }

            if(fields.length === 0){
            return;            
                        }

            values.push(facilityId);

            const query = `
                UPDATE facilities
                SET ${fields.join(', ')}
                WHERE facility_id = ?
            `;
            await conn.query(query, values);
        }catch (error) {
            console.log(error);
            throw new Error('Error updating facility: ' + error.message);
        }finally {
            if (conn) conn.release();
        }

    }
}

export default new FacilityRepo();
