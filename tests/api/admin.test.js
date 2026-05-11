import { describe, test, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import { makeStudent, makeAdmin, makeClub, makeEvent, makeRoom } from '../setup/seed.js';
import { signTokenFor, authHeader } from '../setup/tokens.js';
import { getConnection } from '../../src/config/db.js';

describe('POST /api/admin/users', () => {
    test('403 for student', async () => {
        const s = await makeStudent();
        const res = await request(app).post('/api/admin/users').send({}).set(authHeader(signTokenFor(s)));
        expect(res.status).toBe(403);
    });

    test('400 missing required fields', async () => {
        const a = await makeAdmin();
        const res = await request(app).post('/api/admin/users').send({ first_name: 'X' }).set(authHeader(signTokenFor(a)));
        expect(res.status).toBe(400);
    });

    test('409 duplicate email', async () => {
        const a = await makeAdmin();
        await makeStudent({ email: 'dup@u.test' });
        const res = await request(app).post('/api/admin/users').send({
            first_name: 'A', last_name: 'B', email: 'dup@u.test', password: 'P1!',
            user_name: 'abc', phone: '1', role: 'admin',
        }).set(authHeader(signTokenFor(a)));
        expect(res.status).toBe(409);
    });

    test('201 create admin', async () => {
        const a = await makeAdmin();
        const res = await request(app).post('/api/admin/users').send({
            first_name: 'New', last_name: 'Admin', email: 'na@u.test', password: 'P1!',
            user_name: 'newadmin', phone: '1', role: 'admin',
        }).set(authHeader(signTokenFor(a)));
        expect(res.status).toBe(201);
    });

    test('400 student role missing student-specific fields', async () => {
        const a = await makeAdmin();
        const res = await request(app).post('/api/admin/users').send({
            first_name: 'New', last_name: 'Stu', email: 'ns@u.test', password: 'P1!',
            user_name: 'newstu', phone: '1', role: 'student',
        }).set(authHeader(signTokenFor(a)));
        expect(res.status).toBe(400);
    });
});

describe('POST /api/admin/rooms', () => {
    test('400 missing fields', async () => {
        const a = await makeAdmin();
        const res = await request(app).post('/api/admin/rooms').send({}).set(authHeader(signTokenFor(a)));
        expect(res.status).toBe(400);
    });

    test('200 valid create', async () => {
        const a = await makeAdmin();
        const res = await request(app).post('/api/admin/rooms').send({
            room_number: 300, building_name: 'Z', capacity: 5, type: 'meeting room',
        }).set(authHeader(signTokenFor(a)));
        expect(res.status).toBe(200);
    });
});

describe('POST /api/admin/facilities', () => {
    test('400 missing fields', async () => {
        const a = await makeAdmin();
        const res = await request(app).post('/api/admin/facilities').send({}).set(authHeader(signTokenFor(a)));
        expect(res.status).toBe(400);
    });

    // Regression guard for to_be_continue.md item 6 (passes array vs object).
    test('200 valid create (regression guard for to_be_continue.md item 6)', async () => {
        const a = await makeAdmin();
        const res = await request(app).post('/api/admin/facilities').send({
            name: 'court', location: 'B1', min_capacity: 2, max_capacity: 6, type: 'sport',
        }).set(authHeader(signTokenFor(a)));
        expect(res.status).toBe(200);
    });
});

describe('GET admin reads', () => {
    test('GET /api/admin/stats returns 200 with shape', async () => {
        const a = await makeAdmin();
        const res = await request(app).get('/api/admin/stats').set(authHeader(signTokenFor(a)));
        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
            total_students: expect.any(Number),
            active_clubs: expect.any(Number),
            active_events: expect.any(Number),
        });
    });

    test('GET /api/admin/report returns array', async () => {
        const a = await makeAdmin();
        const res = await request(app).get('/api/admin/report').set(authHeader(signTokenFor(a)));
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('GET /api/admin/facilities-usage returns 3 buckets', async () => {
        const a = await makeAdmin();
        const res = await request(app).get('/api/admin/facilities-usage').set(authHeader(signTokenFor(a)));
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(3);
    });

    test('GET /api/admin/approvals/events returns array', async () => {
        const a = await makeAdmin();
        const club = await makeClub();
        await makeEvent({ club_id: club.club_id, status: 'pending' });
        const res = await request(app).get('/api/admin/approvals/events').set(authHeader(signTokenFor(a)));
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});

describe('PATCH /api/admin/approvals/events/:id', () => {
    test('404 missing room when approving', async () => {
        const a = await makeAdmin();
        const club = await makeClub();
        const event = await makeEvent({ club_id: club.club_id, status: 'pending' });
        const res = await request(app).patch(`/api/admin/approvals/events/${event.event_id}`).send({
            status: 'approved',
        }).set(authHeader(signTokenFor(a)));
        expect(res.status).toBe(404);
    });

    test('200 approve with room', async () => {
        const a = await makeAdmin();
        const club = await makeClub();
        const event = await makeEvent({ club_id: club.club_id, status: 'pending' });
        const room = await makeRoom({ room_number: 901, building_name: 'C' });
        const res = await request(app).patch(`/api/admin/approvals/events/${event.event_id}`).send({
            status: 'approved', room_id: room.room_id,
        }).set(authHeader(signTokenFor(a)));
        expect(res.status).toBe(200);
        const conn = await getConnection();
        try {
            const rows = await conn.query('SELECT status FROM events WHERE event_id = ?', [event.event_id]);
            expect(rows[0].status).toBe('scheduled');
        } finally {
            await conn.release();
        }
    });
});

describe('GET /api/admin/logs', () => {
    test('200 returns logs array (file may be empty)', async () => {
        const a = await makeAdmin();
        const res = await request(app).get('/api/admin/logs').set(authHeader(signTokenFor(a)));
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});
