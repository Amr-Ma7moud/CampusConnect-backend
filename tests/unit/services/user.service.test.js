import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import bcrypt from 'bcryptjs';

const userRepository = {
    createUser: jest.fn(),
    createStudent: jest.fn(),
    createAdmin: jest.fn(),
    getStudentById: jest.fn(),
    getAdminById: jest.fn(),
    getUserByEmail: jest.fn(),
    updateUserStatus: jest.fn(),
    searchForUsers: jest.fn(),
    getAllStudents: jest.fn(),
};
const clubRepository = { getClubIdByManagerId: jest.fn() };

jest.unstable_mockModule('../../../src/repositories/user.repository.js', () => ({ default: userRepository }));
jest.unstable_mockModule('../../../src/repositories/club.repository.js', () => ({ default: clubRepository }));

const { default: userService } = await import('../../../src/services/user.service.js');

describe('UserService.createUser', () => {
    beforeEach(() => Object.values(userRepository).forEach((fn) => fn.mockReset()));

    test('hashes password before persisting', async () => {
        userRepository.createUser.mockResolvedValue(123);
        await userService.createUser({
            first_name: 'A', last_name: 'B', email: 'a@b', password: 'plain', user_name: 'ab', phone: '1', role: 'student',
        });
        const args = userRepository.createUser.mock.calls[0][0];
        const storedHash = args[3];
        expect(storedHash).not.toBe('plain');
        expect(await bcrypt.compare('plain', storedHash)).toBe(true);
    });
});

describe('UserService.banUser / unbanUser', () => {
    beforeEach(() => Object.values(userRepository).forEach((fn) => fn.mockReset()));

    test('banUser sets status to 0', async () => {
        await userService.banUser(5);
        expect(userRepository.updateUserStatus).toHaveBeenCalledWith(5, 0);
    });

    test('unbanUser sets status to 1', async () => {
        await userService.unbanUser(5);
        expect(userRepository.updateUserStatus).toHaveBeenCalledWith(5, 1);
    });
});

describe('UserService.getStudentById', () => {
    beforeEach(() => {
        Object.values(userRepository).forEach((fn) => fn.mockReset());
        Object.values(clubRepository).forEach((fn) => fn.mockReset());
    });

    test('hasClub=true when manager mapping exists', async () => {
        userRepository.getStudentById.mockResolvedValue({
            student_id: 1, first_name: 'A', last_name: 'B', email: 'a', user_name: 'a', faculty: 'CSIT',
            major: 'CS', phone: '1', level: 1, picture: null, in_dorms: 0,
        });
        clubRepository.getClubIdByManagerId.mockResolvedValue(2);
        const r = await userService.getStudentById(1);
        expect(r.hasClub).toBe(true);
    });

    test('hasClub=false when no mapping', async () => {
        userRepository.getStudentById.mockResolvedValue({
            student_id: 1, first_name: 'A', last_name: 'B', email: 'a', user_name: 'a', faculty: 'CSIT',
            major: 'CS', phone: '1', level: 1, picture: null, in_dorms: 0,
        });
        clubRepository.getClubIdByManagerId.mockResolvedValue(null);
        const r = await userService.getStudentById(1);
        expect(r.hasClub).toBe(false);
    });
});
