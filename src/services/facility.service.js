import FacilityRepo from "../repositories/facility.repository.js";
import userRepository from "../repositories/user.repository.js";

class FacilityService {
    STATUSES = ['available', 'closed', 'under_maintenance'];

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

    async getFacilities() {
        try {
            const result = await FacilityRepo.getFacilities();
            return result;
        } catch (error) {
            throw new Error('Error in FacilityService: ' + error.message);
        }
    }
    async getFacilityById(facilityId) {
        try {
            const result = await FacilityRepo.getFacilityById(facilityId);
            return result;
        }catch (error) {
            throw new Error('Error in FacilityService: ' + error.message);
        }
    }

    async reserveFacility({ facilityId, startTime, endTime, teamIds, currentUserId }) {
        try {
            const parseDateTime = (value) => {
                const date = value instanceof Date ? value : new Date(value);
                if (Number.isNaN(date.getTime())) {
                    throw new Error('Invalid datetime values for facility reservation');
                }
                return date;
            };

            const formatDateTime = (date) => {
                const pad = (value) => String(value).padStart(2, '0');
                return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
            };

            const startDate = parseDateTime(startTime);
            const endDate = parseDateTime(endTime);

            if (endDate <= startDate) {
                throw new Error('end_time must be after start_time');
            }

            const normalizedStartTime = formatDateTime(startDate);
            const normalizedEndTime = formatDateTime(endDate);

            const uniqueTeamIds = [...new Set(teamIds.map((id) => Number(id)))];

            if (uniqueTeamIds.length !== teamIds.length) {
                throw new Error('Duplicate team members are not allowed');
            }

            if (uniqueTeamIds.some((id) => !Number.isInteger(id) || id <= 0)) {
                throw new Error('All team members must have valid IDs');
            }

            if (!uniqueTeamIds.includes(Number(currentUserId))) {
                throw new Error('Current user must be included in team_ids');
            }

            const facility = await FacilityRepo.getFacilityById(facilityId);
            if (!facility) {
                throw new Error('Facility not found');
            }

            if (facility.status !== 'available') {
                throw new Error('Facility is not available for reservation');
            }

            // if (uniqueTeamIds.length < facility.min_capacity) {
            //     throw new Error('Team size is below facility minimum capacity');
            // }

            // if (uniqueTeamIds.length > facility.max_capacity) {
            //     throw new Error('Team size exceeds facility maximum capacity');
            // }

            const validStudents = await userRepository.getActiveStudentsByIds(uniqueTeamIds);
            if (validStudents.length !== uniqueTeamIds.length) {
                throw new Error('All team_ids must belong to active student users');
            }

            const hasConflict = await FacilityRepo.hasOverlappingReservation(
                facilityId,
                normalizedStartTime,
                normalizedEndTime
            );

            if (hasConflict) {
                throw new Error('Facility is already reserved for the selected time range');
            }

            return await FacilityRepo.reserveFacility(
                uniqueTeamIds,
                facilityId,
                normalizedStartTime,
                normalizedEndTime
            );
        } catch (error) {
            throw new Error('Error in FacilityService: ' + error.message);
        }
    }

    async reportFacilityIssue(student_id, facility_id, reason, details) {
        try {
            const reportData = [student_id, facility_id, reason, details];
            const result = await FacilityRepo.reportFacilityIssue(reportData);
            return result;
        } catch (error) {
            throw new Error('Error in FacilityService: ' + error.message);
        }
    }

    async updateFacility(facilityId,{name, location, min_capacity, max_capacity, type, status }){
        try{
await FacilityRepo.updateFacility(facilityId,{name, location, min_capacity, max_capacity, type, status });}
catch (error) {
    throw new Error('Error in FacilityService: ' + error.message);}
    }
}

export default new FacilityService();
