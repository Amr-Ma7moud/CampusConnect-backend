import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const findUserByEmail = jest.fn();
const getClubIdByManagerId = jest.fn();

jest.unstable_mockModule('../../../src/repositories/auth.repository.js', () => ({
    default: { findUserByEmail },
}));

jest.unstable_mockModule('../../../src/services/club.service.js', () => ({
    default: { getClubIdByManagerId },
}));

const { default: authService } = await import('../../../src/services/auth.service.js');

const makeUserRow = async (overrides = {}) => ({
    user_id: 7,
    email: 'sara@test.local',
    password: await bcrypt.hash('Password1!', 10),
    role: 'student',
    first_name: 'Sara',
    last_name: 'Student',
    user_name: 'sara',
    ...overrides,
});

describe('AuthService.login', () => {
    beforeEach(() => {
        findUserByEmail.mockReset();
        getClubIdByManagerId.mockReset();
    });

    test('throws when no user exists for the given email', async () => {
        findUserByEmail.mockResolvedValue(null);
        await expect(authService.login('nobody@test.local', 'x')).rejects.toThrow(/Invalid email or password/);
    });

    test('throws when password does not match the stored hash', async () => {
        findUserByEmail.mockResolvedValue(await makeUserRow());
        getClubIdByManagerId.mockResolvedValue(null);
        await expect(authService.login('sara@test.local', 'wrong')).rejects.toThrow(/Invalid email or password/);
    });

    test('returns token + user object for valid credentials, role stays student', async () => {
        findUserByEmail.mockResolvedValue(await makeUserRow());
        getClubIdByManagerId.mockResolvedValue(null);
        const result = await authService.login('sara@test.local', 'Password1!');
        expect(result.token).toEqual(expect.any(String));
        expect(result.user).toMatchObject({
            id: '7',
            email: 'sara@test.local',
            role: 'student',
            first_name: 'Sara',
        });
        const decoded = jwt.verify(result.token, process.env.JWT_SECRET || 'secret_key');
        expect(decoded).toMatchObject({ id: 7, role: 'student', email: 'sara@test.local' });
    });

    test('upgrades role to club_manager when student manages a club', async () => {
        findUserByEmail.mockResolvedValue(await makeUserRow());
        getClubIdByManagerId.mockResolvedValue(99);
        const result = await authService.login('sara@test.local', 'Password1!');
        expect(result.user.role).toBe('club_manager');
        const decoded = jwt.verify(result.token, process.env.JWT_SECRET || 'secret_key');
        expect(decoded.role).toBe('club_manager');
    });

    test('admin role is not consulted against club_manager check', async () => {
        findUserByEmail.mockResolvedValue(await makeUserRow({ role: 'admin' }));
        const result = await authService.login('sara@test.local', 'Password1!');
        expect(getClubIdByManagerId).not.toHaveBeenCalled();
        expect(result.user.role).toBe('admin');
    });
});
