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

        if (!TYPES.includes(roomData.type))
            throw new Error('Invalid room type');

        const room = await RoomRepo.findRoom(roomData.room_number, roomData.building_name);
        if (room)
            throw new Error('This room already exists');

        const result = await RoomRepo.createRoom(roomData);

        if (roomData.resources_ids && Array.isArray(roomData.resources_ids)) {
            for (let resourceId of roomData.resources_ids) {
                await RoomRepo.addResourceToRoom(result, resourceId);
            }
        }

        return result;
    }

    // Helper function to convert ISO 8601 datetime to MySQL DATETIME format
    convertToMySQLDateTime(isoDateTime) {
        const date = new Date(isoDateTime);
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const seconds = String(date.getUTCSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    async resreveRoom(start_time, end_time, purpose, std_ids) {

        /*
             I will get all the rooms and also all the reservations,
             then I reserve the first available 
             room that is not reserved in the given time slot,
             available room means must room.is_available = true
             and also the room is not in the reservations in the given time slot
             or the room reservation time does not overlap with the requested time
             or the resrevation status is cancelled or completed (means that the student left the room)
        */

        // Validate all students exist before attempting reservation
        const studentCheck = await RoomRepo.checkStudentsExist(std_ids);
        if (!studentCheck.allExist) {
            throw new Error(`Invalid student IDs: ${studentCheck.missingIds.join(', ')}`);
        }

        // Convert ISO 8601 datetime to MySQL format
        const mysqlStartTime = this.convertToMySQLDateTime(start_time);
        const mysqlEndTime = this.convertToMySQLDateTime(end_time);

        const allRooms = await RoomRepo.getAllRooms();
        const allReservations = await RoomRepo.getAllRoomsReservations();
        const numberOfStudents = std_ids.length;
        const suitableRooms = allRooms.filter(room => room.capacity >= numberOfStudents);

        suitableRooms.sort((a, b) => a.capacity - b.capacity);

        for (let room of suitableRooms) {
            if (room.is_available) {
                let isReserved = false;

                for (let reservation of allReservations) {
                    if (reservation.room_id === room.room_id) {
                        // Check for time overlap
                        // now the start_time and end_time are date-time strings so edit the comparison
                        if (!(new Date(mysqlEndTime) <= new Date(reservation.start_time) || new Date(mysqlStartTime) >= new Date(reservation.end_time)) &&
                            reservation.status !== 'cancelled' && reservation.status !== 'completed') {
                            isReserved = true;
                            break;
                        }
                    }
                }

                if (!isReserved) {
                    // reserve this room for all students
                    for (let studentId of std_ids) {
                        await RoomRepo.reserveRoom(studentId, room.room_id, mysqlStartTime, mysqlEndTime, purpose);
                    }
                    return {
                        room_id: room.room_id,
                        room_number: room.room_number,
                        building_name: room.building_name
                    }; // return the reserved room
                }
            }
        }

        return null; // No available room found

    }

    async cancelReservation(studentId, roomId, start_time) {
        if(!await RoomRepo.getReservation(studentId, roomId, start_time)) {
            return { 
                success: false,
                message: 'No reservation found for the given student, room, and time'
             };
        }

        await RoomRepo.cancelReservation(studentId, roomId, start_time);

        return {success: true};
    }

    async getAllRooms() {
        const rooms = await RoomRepo.getAllRooms();

        let formattedRooms = [];

        for (let room of rooms) {
            formattedRooms.push({
                id: room.room_id,
                name: room.room_number, // Mapping room_number to name for frontend
                room_number: room.room_number,
                building_name: room.building_name,
                capacity: room.capacity,
                type: room.type,
                status: room.is_available ? 'available' : 'maintenance', // Simple mapping
                start_time: room.start_time,
                end_time: room.end_time,
                resources: room.resources ? room.resources.split(',') : []
            });
        }

        return formattedRooms;
    }

    async reportRoomIssue(student_id, room_id, reason, details) {
            try {
                const reportData = [student_id, room_id, reason, details];
                const result = await RoomRepo.reportRoomIssue(reportData);
                return result;
            } catch (error) {
                throw new Error('Error in RoomService: ' + error.message);
            }
        }

    async createResource(name) {
        if (!name) throw new Error('Resource name is required');
        return await RoomRepo.createResource(name);
    }

    async getAllResources() {
        return await RoomRepo.getAllResources();
    }

async editRoom(roomId,{room_number, building_name, start_time, end_time, capacity, type, is_available, resources_ids}){
    try{
    await RoomRepo.updateRoom(roomId,{room_number, building_name, start_time, end_time, capacity, type, is_available, resources_ids});  
    }catch (error) {    throw new Error('Error in RoomService: ' + error.message);}
    }
async findRoomById(roomId){
    try{
    
        return await RoomRepo.findRoomById(roomId);}
    
    catch (error) {    throw new Error('Error in RoomService: ' + error.message);

    }
}
}

export default new RoomService();