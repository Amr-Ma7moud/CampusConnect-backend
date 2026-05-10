import { describe, test, expect, beforeEach, jest } from '@jest/globals';

const RoomRepo = {
    findRoom: jest.fn(),
    createRoom: jest.fn(),
    addResourceToRoom: jest.fn(),
    getAllRooms: jest.fn(),
    getAllRoomsReservations: jest.fn(),
    reserveRoom: jest.fn(),
    getReservation: jest.fn(),
    cancelReservation: jest.fn(),
    reportRoomIssue: jest.fn(),
    createResource: jest.fn(),
    getAllResources: jest.fn(),
    updateRoom: jest.fn(),
    findRoomById: jest.fn(),
};

jest.unstable_mockModule('../../../src/repositories/room.repository.js', () => ({ default: RoomRepo }));

const { default: roomService } = await import('../../../src/services/room.service.js');

describe('RoomService.createRoom', () => {
    beforeEach(() => Object.values(RoomRepo).forEach((fn) => fn.mockReset()));

    test('rejects non-positive capacity', async () => {
        await expect(roomService.createRoom({ capacity: 0, type: 'public study room' }))
            .rejects.toThrow('Capacity must be a positive number');
    });

    test('rejects invalid room type', async () => {
        await expect(roomService.createRoom({ capacity: 10, type: 'auditorium' }))
            .rejects.toThrow('Invalid room type');
    });

    test('rejects when room with same number+building already exists', async () => {
        RoomRepo.findRoom.mockResolvedValue({ room_id: 5 });
        await expect(roomService.createRoom({ capacity: 10, type: 'theatre', room_number: 1, building_name: 'A' }))
            .rejects.toThrow('This room already exists');
    });

    test('creates the room and links resources', async () => {
        RoomRepo.findRoom.mockResolvedValue(null);
        RoomRepo.createRoom.mockResolvedValue(42);
        await roomService.createRoom({
            capacity: 10, type: 'theatre', room_number: 1, building_name: 'A',
            resources_ids: [1, 2],
        });
        expect(RoomRepo.createRoom).toHaveBeenCalled();
        expect(RoomRepo.addResourceToRoom).toHaveBeenCalledTimes(2);
    });
});

describe('RoomService.resreveRoom (overlap & capacity)', () => {
    beforeEach(() => Object.values(RoomRepo).forEach((fn) => fn.mockReset()));

    test('picks the smallest fitting available room', async () => {
        RoomRepo.getAllRooms.mockResolvedValue([
            { room_id: 1, capacity: 50, is_available: true, room_number: 1, building_name: 'A' },
            { room_id: 2, capacity: 10, is_available: true, room_number: 2, building_name: 'A' },
        ]);
        RoomRepo.getAllRoomsReservations.mockResolvedValue([]);
        const r = await roomService.resreveRoom('2030-01-01T10:00:00', '2030-01-01T11:00:00', 'study', [1, 2, 3]);
        expect(r.room_id).toBe(2);
    });

    test('skips rooms that overlap an active reservation', async () => {
        RoomRepo.getAllRooms.mockResolvedValue([
            { room_id: 1, capacity: 10, is_available: true, room_number: 1, building_name: 'A' },
            { room_id: 2, capacity: 20, is_available: true, room_number: 2, building_name: 'A' },
        ]);
        RoomRepo.getAllRoomsReservations.mockResolvedValue([
            { room_id: 1, start_time: '2030-01-01T10:30:00', end_time: '2030-01-01T11:30:00', status: 'confirmed' },
        ]);
        const r = await roomService.resreveRoom('2030-01-01T10:00:00', '2030-01-01T11:00:00', 'study', [1]);
        expect(r.room_id).toBe(2);
    });

    test('ignores cancelled / completed reservations when looking for overlap', async () => {
        RoomRepo.getAllRooms.mockResolvedValue([
            { room_id: 1, capacity: 10, is_available: true, room_number: 1, building_name: 'A' },
        ]);
        RoomRepo.getAllRoomsReservations.mockResolvedValue([
            { room_id: 1, start_time: '2030-01-01T10:30:00', end_time: '2030-01-01T11:30:00', status: 'cancelled' },
        ]);
        const r = await roomService.resreveRoom('2030-01-01T10:00:00', '2030-01-01T11:00:00', 'study', [1]);
        expect(r.room_id).toBe(1);
    });

    test('returns null when no room can fit', async () => {
        RoomRepo.getAllRooms.mockResolvedValue([
            { room_id: 1, capacity: 2, is_available: true },
        ]);
        RoomRepo.getAllRoomsReservations.mockResolvedValue([]);
        const r = await roomService.resreveRoom('a', 'b', 'study', [1, 2, 3, 4, 5]);
        expect(r).toBeNull();
    });
});

describe('RoomService.cancelReservation', () => {
    beforeEach(() => Object.values(RoomRepo).forEach((fn) => fn.mockReset()));

    test('returns failure object when no reservation exists', async () => {
        RoomRepo.getReservation.mockResolvedValue(null);
        const r = await roomService.cancelReservation(1, 2, 't');
        expect(r.success).toBe(false);
    });

    test('returns success on cancellation', async () => {
        RoomRepo.getReservation.mockResolvedValue({});
        const r = await roomService.cancelReservation(1, 2, 't');
        expect(r.success).toBe(true);
    });
});

describe('RoomService.createResource', () => {
    test('rejects empty name', async () => {
        await expect(roomService.createResource('')).rejects.toThrow('Resource name is required');
    });
});
