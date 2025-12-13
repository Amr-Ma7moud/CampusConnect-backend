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
            if (conn) conn.end();
        }
    }
}

export default new FacilityRepo();