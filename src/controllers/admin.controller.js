import adminService from "../services/admin.service";


export const getReports = async (req, res) => {
    try {
        const reports = await adminService.getAllReports();
        res.status(200).json(reports);
    } catch(err) {
        res.status(500).json({ message: 'Error getting reports: ' + err.message });
    }
};

export const getStats = async (req, res) => {
    try {
        const stats = await adminService.getStats();
        res.status(200).json(stats);
    } catch (err) { 
        res.status(500).json({ message: 'Error getting stats: ' + err.message });
    }
};

export const getAttendaceOverview = async (req, res) => {
    try {
        const attendance = await adminService.getAttendanceOverview();
        res.status(200).json(attendance);
    } catch (err) {
        res.status(500).json({ message: 'Error getting attendance: ' + err.message });
    }
};