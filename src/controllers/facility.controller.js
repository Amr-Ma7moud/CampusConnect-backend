import FacilityService from "../services/facility.service.js";
import { saveLog } from "../utils/logs.js";

export const createFacility = async (req, res) => {
    let { name, location, min_capacity, max_capacity, type, status } = req.body;
    try {
        if (!name || !location || !min_capacity || !max_capacity || !type)
            return res.status(400).json({ message: 'Missing required fields' });
        if (!status)
            status = 'available';
        await FacilityService.createFacility([name, location, min_capacity, max_capacity, type, status]);

        await saveLog({
            ip_address: req.ip,
            user_type: 'admin',
            record_id: name, // Using name as ID since ID isn't returned
            edited_table: 'facilities',
            action: 'create',
            changed_by: req.user ? req.user.id : 'admin'
        });

        return res.status(200).json({ message: 'Facility created successfully' });
    } catch (err) {
        throw new Error('Error creating facility: ' + err.message);
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
            user_type: 'student',
            record_id: facility_id,
            edited_table: 'std_report_facility',
            action: 'report_issue',
            changed_by: userId
        });

        return res.status(200).json({ message: 'Facility issue reported successfully' });

    } catch (err) {
        res.status(500).json({ message: 'Error reporting facility issue: ' + err.message });
    }
}