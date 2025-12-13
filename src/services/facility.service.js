import FacilityRepo from "../repositories/facility.repository.js";

class FacilityService {
    STATUSES = ['available', 'unavailable', 'under_maintenance'];

    /**
     * @param {Object} facilityDetails
     */
    async createFacility({ name, location, min_capacity, max_capacity, type, status }) {
        try {

            if (min_capacity > max_capacity) {
                throw new Error('Minimum capacity cannot be greater than maximum capacity');
            }
            if (min_capacity < 0 || max_capacity < 0) {
                throw new Error('Capacity values must be non-negative');
            }
            if ( ! this.STATUSES.includes(status) ) {
                throw new Error('Invalid status value');
            }
            
            const facilityData = [name, location, min_capacity, max_capacity, type, status];
            const result = await FacilityRepo.createFacility(facilityData);
            return result;
        } catch (error) {
            throw new Error('Error in FacilityService: ' + error.message);
        }
    }
}

export default new FacilityService();