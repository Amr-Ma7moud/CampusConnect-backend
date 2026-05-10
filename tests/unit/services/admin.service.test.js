import { describe, test, expect, beforeEach, jest } from '@jest/globals';

const eventRepository = {
    getAllReports: jest.fn(),
    getAllEvents: jest.fn(),
    getAttendanceForAllEvents: jest.fn(),
    getAllPendingEvents: jest.fn(),
    updateEventStatus: jest.fn(),
    assignRoomToEvent: jest.fn(),
};
const clubRepository = { getAllReports: jest.fn(), getAllClubs: jest.fn() };
const roomRepository = {
    getAllReports: jest.fn(),
    getAllRoomsReservations: jest.fn(),
    getCompletedReservationsCount: jest.fn(),
};
const facilityRepository = {
    getAllReports: jest.fn(),
    getCompletedReservationsCountByType: jest.fn(),
};
const userRepository = { getAllStudents: jest.fn() };

jest.unstable_mockModule('../../../src/repositories/event.repository.js', () => ({ default: eventRepository }));
jest.unstable_mockModule('../../../src/repositories/club.repository.js', () => ({ default: clubRepository }));
jest.unstable_mockModule('../../../src/repositories/room.repository.js', () => ({ default: roomRepository }));
jest.unstable_mockModule('../../../src/repositories/facility.repository.js', () => ({ default: facilityRepository }));
jest.unstable_mockModule('../../../src/repositories/user.repository.js', () => ({ default: userRepository }));

const { default: adminService } = await import('../../../src/services/admin.service.js');

const resetAll = () => {
    [eventRepository, clubRepository, roomRepository, facilityRepository, userRepository]
        .forEach(repo => Object.values(repo).forEach((fn) => fn.mockReset && fn.mockReset()));
};

describe('AdminService.getAllReports', () => {
    beforeEach(resetAll);

    test('flattens reports from all sources into a single array', async () => {
        clubRepository.getAllReports.mockResolvedValue([{ student_id: 1, club_id: 1, status: 'open', details: 'd', reason: 'r', date: 't' }]);
        eventRepository.getAllReports.mockResolvedValue([{ student_id: 2, club_id: 5, status: 'open', details: 'd', reason: 'r', date: 't' }]);
        roomRepository.getAllReports.mockResolvedValue([{ student_id: 3, club_id: 7, status: 'open', details: 'd', reason: 'r', date: 't' }]);
        facilityRepository.getAllReports.mockResolvedValue([{ student_id: 4, club_id: 9, status: 'open', details: 'd', reason: 'r', report_date: 't' }]);

        const r = await adminService.getAllReports();
        expect(r).toHaveLength(4);
        const types = r.map(x => x.report_type).sort();
        expect(types).toEqual(['club', 'event', 'facility', 'room']);
    });
});

describe('AdminService.getStats', () => {
    beforeEach(resetAll);

    test('counts only active clubs and events', async () => {
        userRepository.getAllStudents.mockResolvedValue([{}, {}, {}]);
        facilityRepository.getCompletedReservationsCountByType.mockResolvedValue(0);
        clubRepository.getAllClubs.mockResolvedValue([
            { status: 'active' }, { status: 'closed' }, { status: 'active' },
        ]);
        eventRepository.getAllEvents.mockResolvedValue([
            { type: 'event' }, { type: 'session' }, { type: 'event' },
        ]);
        roomRepository.getAllRoomsReservations.mockResolvedValue([
            { room_id: 1 }, { room_id: 1 }, { room_id: 2 },
        ]);
        const r = await adminService.getStats();
        expect(r).toMatchObject({
            total_students: 3,
            active_clubs: 2,
            active_events: 2,
            active_sessions: 1,
            reserved_rooms: 2,
        });
    });
});

describe('AdminService.getFacilitiesUsage', () => {
    beforeEach(resetAll);

    test('returns zero distribution when no reservations', async () => {
        roomRepository.getCompletedReservationsCount.mockResolvedValue(0);
        facilityRepository.getCompletedReservationsCountByType.mockResolvedValue(0);
        const r = await adminService.getFacilitiesUsage();
        expect(r).toEqual([
            { type: 'room', value: 0 },
            { type: 'gym', value: 0 },
            { type: 'playground', value: 0 },
        ]);
    });

    test('returns percentage breakdown', async () => {
        roomRepository.getCompletedReservationsCount.mockResolvedValue(50);
        facilityRepository.getCompletedReservationsCountByType
            .mockResolvedValueOnce(30) // gym
            .mockResolvedValueOnce(20); // playground
        const r = await adminService.getFacilitiesUsage();
        const sum = r.reduce((s, x) => s + x.value, 0);
        expect(Math.round(sum)).toBe(100);
    });
});

describe('AdminService.approveEvent', () => {
    beforeEach(resetAll);

    test('approval sets event to scheduled and assigns room', async () => {
        await adminService.approveEvent(1, 'approved', 5);
        expect(eventRepository.updateEventStatus).toHaveBeenCalledWith(1, 'scheduled');
        expect(eventRepository.assignRoomToEvent).toHaveBeenCalledWith(1, 5);
    });

    test('rejection sets event to cancelled', async () => {
        await adminService.approveEvent(1, 'rejected', null);
        expect(eventRepository.updateEventStatus).toHaveBeenCalledWith(1, 'cancelled');
        expect(eventRepository.assignRoomToEvent).not.toHaveBeenCalled();
    });
});
