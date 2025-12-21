import adminService from "../services/admin.service";


export const getReports = async (req, res) => {
    
};

export const getStats = async (req, res) => {
    try {
        const stats = await adminService.getStats();
        res.status(200).json(stats);
    } catch (err) { 
        res.status(500).json({ message: 'Error getting status: ' + err.message });
    }
};