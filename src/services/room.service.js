import RoomRepo from "../repositories/room.repository.js";
class RoomService {

    /**
    *@param {Object} roomData - The data for the room to be created with properties:
    room_number, building_name, start_time, end_time, capacity, type, is_available
    *@returns {Object} - The result of the room creation operation
    */
    async createRoom(roomData) {
        const TYPES = ['public study room', 'private study room', 'meeting room', 'theatre'];

        if (roomData.capacity <= 0) 
            throw new Error('Capacity must be a positive number');
        
        if( ! TYPES.includes(roomData.type))
            throw new Error('Invalid room type');

        const room = await RoomRepo.findRoom(roomData.room_number, roomData.building_name);
        if (room) 
            throw new Error('This room already exists');

        const result = await RoomRepo.createRoom(roomData);
        return result;
    }
}

export default new RoomService();