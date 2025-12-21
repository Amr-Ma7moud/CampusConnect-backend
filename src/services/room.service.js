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

        for(let resourceId of roomData.resources_ids) {
            await RoomRepo.addResourceToRoom(result, resourceId);
        }

        return result;
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
                        if (!(new Date(end_time) <= new Date(reservation.start_time) || new Date(start_time) >= new Date(reservation.end_time)) &&
                            reservation.status !== 'cancelled' && reservation.status !== 'completed') {
                            isReserved = true;
                            break;
                        }
                    }
                }

                if (!isReserved) {
                    // reserve this room for all students
                    for (let studentId of std_ids) {
                        await RoomRepo.reserveRoom(studentId, room.room_id, start_time, end_time, purpose);
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
            throw new Error('Reservation not found');
        }

        await RoomRepo.cancelReservation(studentId, roomId, start_time);
    }

    async getAllRooms() {
        const rooms = await RoomRepo.getAllRooms();

        let formattedRooms = [];

        for(let room of rooms) {
            formattedRooms.push({
                room_id: room.room_id,
                room_number: room.room_number,
                building_name: room.building_name,
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
}

export default new RoomService();