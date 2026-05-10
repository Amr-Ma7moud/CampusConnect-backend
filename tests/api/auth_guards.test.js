import { describe, test, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import { signMalformedToken, signExpiredToken, signTokenFor, authHeader } from '../setup/tokens.js';
import { makeStudent } from '../setup/seed.js';

const PROTECTED_GET = [
    '/api/users/me',
    '/api/events/',
    '/api/clubs/',
    '/api/posts/',
    '/api/rooms/',
    '/api/facilities/',
];

const ADMIN_ONLY = [
    { method: 'get', path: '/api/admin/stats' },
    { method: 'get', path: '/api/admin/report' },
    { method: 'get', path: '/api/users/students' },
];

describe('cross-cutting auth guards', () => {
    test.each(PROTECTED_GET)('GET %s returns 401 with no token', async (path) => {
        const res = await request(app).get(path);
        expect(res.status).toBe(401);
    });

    test.each(PROTECTED_GET)('GET %s returns 401 with malformed token', async (path) => {
        const res = await request(app).get(path).set(authHeader(signMalformedToken()));
        expect(res.status).toBe(401);
    });

    test.each(PROTECTED_GET)('GET %s returns 401 with expired token', async (path) => {
        const fakeUser = { user_id: 1, role: 'student', email: 'x@y.z' };
        const res = await request(app).get(path).set(authHeader(signExpiredToken(fakeUser)));
        expect(res.status).toBe(401);
    });

    test.each(ADMIN_ONLY)('admin-only %j returns 403 for student', async ({ method, path }) => {
        const s = await makeStudent();
        const res = await request(app)[method](path).set(authHeader(signTokenFor(s)));
        expect(res.status).toBe(403);
    });

    test('GET /api/reservations/ is student-only and rejects admin', async () => {
        const fakeAdmin = { user_id: 999, role: 'admin', email: 'a@a' };
        const res = await request(app).get('/api/reservations/').set(authHeader(signTokenFor(fakeAdmin)));
        expect(res.status).toBe(403);
    });
});
