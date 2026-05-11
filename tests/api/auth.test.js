import { describe, test, expect } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/app.js';
import { makeStudent, makeAdmin, makeClub } from '../setup/seed.js';
import { getConnection } from '../../src/config/db.js';

describe('POST /api/auth/login', () => {
    test('400 when email missing', async () => {
        const res = await request(app).post('/api/auth/login').send({ password: 'x' });
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/required/i);
    });

    test('400 when password missing', async () => {
        const res = await request(app).post('/api/auth/login').send({ email: 'a@b.c' });
        expect(res.status).toBe(400);
    });

    test('401 when email does not exist', async () => {
        const res = await request(app).post('/api/auth/login').send({ email: 'ghost@nope.test', password: 'x' });
        expect(res.status).toBe(401);
        expect(res.body.message).toMatch(/Invalid email or password/);
    });

    test('401 when password is wrong', async () => {
        await makeStudent({ email: 'sara@test.local', password: 'Correct1!' });
        const res = await request(app).post('/api/auth/login').send({ email: 'sara@test.local', password: 'wrong' });
        expect(res.status).toBe(401);
    });

    test('200 with token and user object on valid credentials (student role)', async () => {
        const s = await makeStudent({ email: 'sara2@test.local', password: 'Correct1!' });
        const res = await request(app).post('/api/auth/login').send({ email: 'sara2@test.local', password: 'Correct1!' });
        expect(res.status).toBe(200);
        expect(res.body.token).toEqual(expect.any(String));
        expect(res.body.user).toMatchObject({
            email: 'sara2@test.local',
            role: 'student',
        });
        const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
        expect(decoded).toMatchObject({ id: s.user_id, role: 'student', email: 'sara2@test.local' });
    });

    test('admin logs in with admin role in token', async () => {
        await makeAdmin({ email: 'admin@test.local', password: 'AdminP1!' });
        const res = await request(app).post('/api/auth/login').send({ email: 'admin@test.local', password: 'AdminP1!' });
        expect(res.status).toBe(200);
        expect(res.body.user.role).toBe('admin');
    });

    test('student who manages a club gets club_manager role in token', async () => {
        const student = await makeStudent({ email: 'mgr@test.local', password: 'MgrP1!' });
        const club = await makeClub();
        const conn = await getConnection();
        try {
            await conn.query('INSERT INTO club_manager (student_id, club_id, role_title) VALUES (?, ?, ?)',
                [student.user_id, club.club_id, 'head']);
        } finally {
            await conn.release();
        }
        const res = await request(app).post('/api/auth/login').send({ email: 'mgr@test.local', password: 'MgrP1!' });
        expect(res.status).toBe(200);
        expect(res.body.user.role).toBe('club_manager');
    });
});
