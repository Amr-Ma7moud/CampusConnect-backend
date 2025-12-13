import FacilityService from "../services/facility.service.js";

export const createFacility = async (req, res) => {
    let { name, location, min_capacity, max_capacity, type, status } = req.body;
    try {
        if (!name || !location || !min_capacity || !max_capacity || !type ) 
            return res.status(400).json({ message: 'Missing required fields' });
        if (!status) 
            status = 'available';
        await FacilityService.createFacility([ name, location, min_capacity, max_capacity, type, status ]);
        return res.status(200).json({ message: 'Facility created successfully' });
    }catch (err) {
        throw new Error('Error creating facility: ' + err.message);
    }

};