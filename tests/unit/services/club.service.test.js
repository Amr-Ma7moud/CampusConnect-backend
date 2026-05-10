import { describe, test, expect, beforeEach, jest } from '@jest/globals';

const ClubRepo = {
    createClub: jest.fn(),
    addMembersToClub: jest.fn(),
    upgradeStudentToClubManager: jest.fn(),
    findClubByEmail: jest.fn(),
    findClubById: jest.fn(),
    findClubMembers: jest.fn(),
    updateClubDetails: jest.fn(),
    addFollower: jest.fn(),
    deleteFollower: jest.fn(),
    getClubFollowers: jest.fn(),
    getAllClubsWithDetails: jest.fn(),
    getClubIdByManagerId: jest.fn(),
    reportClubIssue: jest.fn(),
};
const eventService = { getAllClubEvents: jest.fn() };

jest.unstable_mockModule('../../../src/repositories/club.repository.js', () => ({ default: ClubRepo }));
jest.unstable_mockModule('../../../src/services/event.service.js', () => ({ default: eventService }));

const { default: clubService } = await import('../../../src/services/club.service.js');

describe('ClubService.createClub', () => {
    beforeEach(() => {
        Object.values(ClubRepo).forEach((fn) => fn.mockReset());
    });

    test('creates club without managers when std_ids is empty', async () => {
        ClubRepo.createClub.mockResolvedValue(1);
        const id = await clubService.createClub({ name: 'X', email: 'x@y', description: 'd', std_ids: [] });
        expect(id).toBe(1);
        expect(ClubRepo.addMembersToClub).not.toHaveBeenCalled();
        expect(ClubRepo.upgradeStudentToClubManager).not.toHaveBeenCalled();
    });

    test('creates club with managers and upgrades each student', async () => {
        ClubRepo.createClub.mockResolvedValue(2);
        await clubService.createClub({ name: 'X', email: 'x@y', description: 'd', std_ids: [10, 11] });
        expect(ClubRepo.addMembersToClub).toHaveBeenCalled();
        expect(ClubRepo.upgradeStudentToClubManager).toHaveBeenCalledTimes(2);
    });
});

describe('ClubService.checkUserIsClubManager', () => {
    beforeEach(() => {
        Object.values(ClubRepo).forEach((fn) => fn.mockReset());
    });

    test('returns true when user appears in members list', async () => {
        ClubRepo.findClubMembers.mockResolvedValue([{ student_id: 5 }, { student_id: 6 }]);
        expect(await clubService.checkUserIsClubManager(1, 6)).toBe(true);
    });

    test('returns false otherwise', async () => {
        ClubRepo.findClubMembers.mockResolvedValue([{ student_id: 5 }]);
        expect(await clubService.checkUserIsClubManager(1, 99)).toBe(false);
    });
});

describe('ClubService.isUserFollowingClub', () => {
    beforeEach(() => {
        Object.values(ClubRepo).forEach((fn) => fn.mockReset());
    });

    test('returns true when user appears in followers', async () => {
        ClubRepo.getClubFollowers.mockResolvedValue([{ student_id: 7 }]);
        expect(await clubService.isUserFollowingClub(1, 7)).toBe(true);
    });
});
