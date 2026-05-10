import { describe, test, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import { makeStudent, makeAdmin } from '../setup/seed.js';
import { signTokenFor, authHeader } from '../setup/tokens.js';
import { getConnection } from '../../src/config/db.js';

describe('GET /api/users/me', () => {
    test('401 without token', async () => {
        const res = await request(app).get('/api/users/me');
        expect(res.status).toBe(401);
    });

    test('200 with student profile when authenticated as student', async () => {
        const s = await makeStudent({ first_name: 'Sara', last_name: 'X', email: 'sx@test.local' });
        const token = signTokenFor(s);
        const res = await request(app).get('/api/users/me').set(authHeader(token));
        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({ first_name: 'Sara', email: 'sx@test.local' });
    });

    test('200 with admin profile when authenticated as admin', async () => {
        const a = await makeAdmin({ email: 'a@test.local' });
        const token = signTokenFor(a);
        const res = await request(app).get('/api/users/me').set(authHeader(token));
        expect(res.status).toBe(200);
    });
});

describe('GET /api/users/students (admin-only)', () => {
    test('401 without token', async () => {
        const res = await request(app).get('/api/users/students');
        expect(res.status).toBe(401);
    });

    test('403 for student', async () => {
        const s = await makeStudent();
        const res = await request(app).get('/api/users/students').set(authHeader(signTokenFor(s)));
        expect(res.status).toBe(403);
    });

    test('200 for admin and returns array', async () => {
        const a = await makeAdmin();
        await makeStudent({ first_name: 'A' });
        await makeStudent({ first_name: 'B' });
        const res = await request(app).get('/api/users/students').set(authHeader(signTokenFor(a)));
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(2);
    });
});

describe('PATCH /api/users/:id/ban and /unban (admin-only)', () => {
    test('403 for non-admin', async () => {
        const s = await makeStudent();
        const target = await makeStudent();
        const res = await request(app).patch(`/api/users/${target.user_id}/ban`).set(authHeader(signTokenFor(s)));
        expect(res.status).toBe(403);
    });

    test('200 + DB flip on ban', async () => {
        const a = await makeAdmin();
        const target = await makeStudent();
        const res = await request(app).patch(`/api/users/${target.user_id}/ban`).set(authHeader(signTokenFor(a)));
        expect(res.status).toBe(200);
        const conn = await getConnection();
        try {
            const rows = await conn.query('SELECT is_active FROM users WHERE user_id = ?', [target.user_id]);
            expect(Number(rows[0].is_active)).toBe(0);
        } finally {
            await conn.release();
        }
    });

    test('200 + DB flip on unban', async () => {
        const a = await makeAdmin();
        const target = await makeStudent({ is_active: false });
        const res = await request(app).patch(`/api/users/${target.user_id}/unban`).set(authHeader(signTokenFor(a)));
        expect(res.status).toBe(200);
        const conn = await getConnection();
        try {
            const rows = await conn.query('SELECT is_active FROM users WHERE user_id = ?', [target.user_id]);
            expect(Number(rows[0].is_active)).toBe(1);
        } finally {
            await conn.release();
        }
    });
});

describe('GET /api/users/ (search, admin-only)', () => {
    test('403 for student', async () => {
        const s = await makeStudent();
        const res = await request(app).get('/api/users/').set(authHeader(signTokenFor(s)));
        expect(res.status).toBe(403);
    });
});
