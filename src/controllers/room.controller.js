import RoomService from "../services/room.service.js";

export const createRoom = async (req, res) => {
    let { room_number, building_name, start_time, end_time, capacity, type, is_available } = req.body;
    try {
        if (!room_number || !building_name || !capacity || !type) 
            return res.status(400).json({ message: 'Missing required fields' });

        if ( !start_time ) 
            start_time = 4;

            if ( !end_time ) 
            end_time = 10;

        // Default values for testing
        if ( !is_available ) 
            is_available = true;

        await RoomService.createRoom({room_number, building_name, start_time, end_time, capacity, type, is_available});
        return res.status(200).json({ message: 'Room created successfully' });
    }catch (err) {
        // todo  i have to make the error codes as MR Senior forget to do so @mostafa3ssa

        return res.status(500).json({ message: 'Server error' });
    }
}
