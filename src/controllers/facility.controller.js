import FacilityService from "../services/facility.service.js";
import { saveLog } from "../utils/logs.js";

export const createFacility = async (req, res) => {
    let { name, location, min_capacity, max_capacity, type, status } = req.body;
    try {
        if (!name || !location || !min_capacity || !max_capacity || !type)
            return res.status(400).json({ message: 'Missing required fields' });
        if (!status)
            status = 'available';
        await FacilityService.createFacility({name, location, min_capacity, max_capacity, type, status});

        await saveLog({
            ip_address: req.ip,
            user_type: 'admin',
            record_id: name, // Using name as ID since ID isn't returned
            edited_table: 'facilities',
            action: 'create',
            changed_by: req.user ? req.user.id.toString() : 'admin'
        });

        return res.status(200).json({ message: 'Facility created successfully' });
    } catch (err) {
        throw new Error('Error creating facility: ' + err.message);
    }

};

export const getFacilities = async (req, res) => {
    try {
        const facilities = await FacilityService.getFacilities();
        res.status(200).json(facilities);
    } catch (err) {
        res.status(500).json({ message: 'Error getting facilities: ' + err.message });
    }
};

export const reserveFacility = async (req, res) => {
    try {
        const facilityId = Number(req.params.id);
        const { start_time, end_time, team_ids } = req.body;
        const currentUserId = req.user.id;

        if (!Number.isInteger(facilityId) || facilityId <= 0) {
            return res.status(400).json({ message: 'Invalid facility ID' });
        }

        if (!start_time || !end_time || !Array.isArray(team_ids) || team_ids.length === 0) {
            return res.status(400).json({
                message: 'Missing required fields',
                details: 'start_time, end_time, and a non-empty team_ids array are required.'
            });
        }

        const startDate = new Date(start_time);
        const endDate = new Date(end_time);

        if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
            return res.status(400).json({ message: 'start_time and end_time must be valid datetime values' });
        }

        if (endDate <= startDate) {
            return res.status(400).json({ message: 'end_time must be after start_time' });
        }

        const formatDateTime = (date) => {
            const pad = (value) => String(value).padStart(2, '0');
            return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
        };

        const reservation = await FacilityService.reserveFacility({
            facilityId,
            startTime: formatDateTime(startDate),
            endTime: formatDateTime(endDate),
            teamIds: team_ids,
            currentUserId,
        });

        await saveLog({
            ip_address: req.ip,
            user_type: req.user.role,
            record_id: facilityId.toString(),
            edited_table: 'std_reserve_facility',
            action: 'reserve',
            changed_by: currentUserId.toString()
        });

        return res.status(201).json({
            message: 'Facility reserved successfully',
            reservation,
        });
    } catch (err) {
        if (err.message.includes('Facility not found')) {
            return res.status(404).json({ message: 'Facility not found' });
        }

        if (err.message.includes('already reserved')) {
            return res.status(409).json({ message: err.message });
        }

        if (
            err.message.includes('Current user must be included') ||
            err.message.includes('Duplicate team members') ||
            err.message.includes('All team members must have valid IDs') ||
            err.message.includes('All team_ids must belong to active student users') ||
            err.message.includes('minimum capacity') ||
            err.message.includes('maximum capacity') ||
            err.message.includes('not available for reservation')
        ) {
            return res.status(400).json({ message: err.message });
        }

        return res.status(500).json({ message: 'Error reserving facility: ' + err.message });
    }
};

export const reportFacilityIssue = async (req, res) => {
    try {
        const { facility_id, reason, details } = req.body;
        const userId = req.user.id;

        if (!facility_id || !reason || !details) {
            return res.status(400).json({
                message: 'Missing required fields',
                details: 'facility_id, reason, and details are required.'
            });
        }

        const result = await FacilityService.reportFacilityIssue(userId, facility_id, reason, details);

        await saveLog({
            ip_address: req.ip,
            user_type: req.user.role,
            record_id: facility_id.toString(),
            edited_table: 'std_report_facility',
            action: 'report_issue',
            changed_by: userId.toString()
        });

        return res.status(200).json({ message: 'Facility issue reported successfully' });

    } catch (err) {
        res.status(500).json({ message: 'Error reporting facility issue: ' + err.message });
    }
}
export const updateFacility=async (req,res)=>{
const facilityId = req.params.id;
    if(! await FacilityService.getFacilityById(facilityId)){
return res.status(404).json({ message: 'Facility not found' });
    }
    const {name, location, min_capacity, max_capacity, type, status } = req.body;
    try{
await FacilityService.updateFacility(facilityId,{name, location, min_capacity, max_capacity, type, status });
res.status(200).json({ message: 'Facility updated successfully' });
    }catch(err){
        res.status(500).json({ message: 'Error updating facility: ' + err.message });
    }
};