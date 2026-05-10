import { describe, test, expect, beforeEach, jest } from '@jest/globals';

const FacilityRepo = {
    createFacility: jest.fn(),
    getFacilities: jest.fn(),
    getFacilityById: jest.fn(),
    reserveFacility: jest.fn(),
    hasOverlappingReservation: jest.fn(),
    reportFacilityIssue: jest.fn(),
    updateFacility: jest.fn(),
};
const userRepository = {
    getActiveStudentsByIds: jest.fn(),
};

jest.unstable_mockModule('../../../src/repositories/facility.repository.js', () => ({ default: FacilityRepo }));
jest.unstable_mockModule('../../../src/repositories/user.repository.js', () => ({ default: userRepository }));

const { default: facilityService } = await import('../../../src/services/facility.service.js');

describe('FacilityService.createFacility', () => {
    beforeEach(() => {
        Object.values(FacilityRepo).forEach((fn) => fn.mockReset());
    });

    test('rejects when min_capacity > max_capacity', async () => {
        await expect(facilityService.createFacility({
            name: 'gym', location: 'B', min_capacity: 10, max_capacity: 5, type: 'sport', status: 'available'
        })).rejects.toThrow(/Minimum capacity cannot be greater/);
    });

    test('rejects negative capacity', async () => {
        await expect(facilityService.createFacility({
            name: 'gym', location: 'B', min_capacity: -1, max_capacity: 5, type: 'sport', status: 'available'
        })).rejects.toThrow(/Capacity values must be non-negative/);
    });

    test('rejects invalid status', async () => {
        await expect(facilityService.createFacility({
            name: 'gym', location: 'B', min_capacity: 1, max_capacity: 5, type: 'sport', status: 'broken'
        })).rejects.toThrow(/Invalid status value/);
    });

    test('happy path delegates to repo', async () => {
        FacilityRepo.createFacility.mockResolvedValue(1);
        await facilityService.createFacility({
            name: 'gym', location: 'B', min_capacity: 1, max_capacity: 5, type: 'sport', status: 'available'
        });
        expect(FacilityRepo.createFacility).toHaveBeenCalled();
    });
});

describe('FacilityService.reserveFacility', () => {
    const baseFacility = { facility_id: 1, status: 'available', min_capacity: 2, max_capacity: 5 };
    beforeEach(() => {
        Object.values(FacilityRepo).forEach((fn) => fn.mockReset());
        userRepository.getActiveStudentsByIds.mockReset();
    });

    test('rejects duplicate team IDs', async () => {
        await expect(facilityService.reserveFacility({
            facilityId: 1, startTime: 's', endTime: 'e', teamIds: [1, 1, 2], currentUserId: 1,
        })).rejects.toThrow(/Duplicate team members/);
    });

    test('rejects when current user not in team_ids', async () => {
        await expect(facilityService.reserveFacility({
            facilityId: 1, startTime: 's', endTime: 'e', teamIds: [2, 3], currentUserId: 1,
        })).rejects.toThrow(/Current user must be included/);
    });

    test('rejects when facility does not exist', async () => {
        FacilityRepo.getFacilityById.mockResolvedValue(null);
        await expect(facilityService.reserveFacility({
            facilityId: 99, startTime: 's', endTime: 'e', teamIds: [1, 2], currentUserId: 1,
        })).rejects.toThrow(/Facility not found/);
    });

    test('rejects when facility not available', async () => {
        FacilityRepo.getFacilityById.mockResolvedValue({ ...baseFacility, status: 'closed' });
        await expect(facilityService.reserveFacility({
            facilityId: 1, startTime: 's', endTime: 'e', teamIds: [1, 2], currentUserId: 1,
        })).rejects.toThrow(/not available/);
    });

    test('rejects team size below min_capacity', async () => {
        FacilityRepo.getFacilityById.mockResolvedValue(baseFacility);
        await expect(facilityService.reserveFacility({
            facilityId: 1, startTime: 's', endTime: 'e', teamIds: [1], currentUserId: 1,
        })).rejects.toThrow(/below facility minimum capacity/);
    });

    test('rejects team size above max_capacity', async () => {
        FacilityRepo.getFacilityById.mockResolvedValue(baseFacility);
        await expect(facilityService.reserveFacility({
            facilityId: 1, startTime: 's', endTime: 'e', teamIds: [1, 2, 3, 4, 5, 6], currentUserId: 1,
        })).rejects.toThrow(/exceeds facility maximum capacity/);
    });

    test('rejects when some team members are not active students', async () => {
        FacilityRepo.getFacilityById.mockResolvedValue(baseFacility);
        userRepository.getActiveStudentsByIds.mockResolvedValue([{ user_id: 1 }]);
        await expect(facilityService.reserveFacility({
            facilityId: 1, startTime: 's', endTime: 'e', teamIds: [1, 2], currentUserId: 1,
        })).rejects.toThrow(/active student users/);
    });

    test('rejects on overlapping reservation', async () => {
        FacilityRepo.getFacilityById.mockResolvedValue(baseFacility);
        userRepository.getActiveStudentsByIds.mockResolvedValue([{ user_id: 1 }, { user_id: 2 }]);
        FacilityRepo.hasOverlappingReservation.mockResolvedValue(true);
        await expect(facilityService.reserveFacility({
            facilityId: 1, startTime: 's', endTime: 'e', teamIds: [1, 2], currentUserId: 1,
        })).rejects.toThrow(/already reserved/);
    });

    test('happy path returns repo result', async () => {
        FacilityRepo.getFacilityById.mockResolvedValue(baseFacility);
        userRepository.getActiveStudentsByIds.mockResolvedValue([{ user_id: 1 }, { user_id: 2 }]);
        FacilityRepo.hasOverlappingReservation.mockResolvedValue(false);
        FacilityRepo.reserveFacility.mockResolvedValue({ ok: true });
        const r = await facilityService.reserveFacility({
            facilityId: 1, startTime: 's', endTime: 'e', teamIds: [1, 2], currentUserId: 1,
        });
        expect(r).toEqual({ ok: true });
    });
});
