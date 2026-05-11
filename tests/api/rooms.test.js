import { describe, test, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import { makeStudent, makeAdmin, makeRoom } from '../setup/seed.js';
import { signTokenFor, authHeader } from '../setup/tokens.js';
import { getConnection } from '../../src/config/db.js';

describe('GET /api/rooms/', () => {
    test('200 with array of rooms', async () => {
        const s = await makeStudent();
        await makeRoom({ room_number: 1, building_name: 'A' });
        const res = await request(app).get('/api/rooms/').set(authHeader(signTokenFor(s)));
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});

describe('POST /api/rooms/reserve', () => {
    test('400 when fields missing', async () => {
        const s = await makeStudent();
        const res = await request(app).post('/api/rooms/reserve').send({}).set(authHeader(signTokenFor(s)));
        expect(res.status).toBe(400);
    });

    test('404 when no fitting room available', async () => {
        const s = await makeStudent();
        const res = await request(app).post('/api/rooms/reserve').send({
            start_time: '2030-01-01T10:00:00',
            end_time: '2030-01-01T11:00:00',
            purpose: 'study',
            std_ids: [s.user_id],
        }).set(authHeader(signTokenFor(s)));
        expect(res.status).toBe(404);
    });

    test('200 reserves smallest fitting room and writes to DB', async () => {
        const s = await makeStudent();
        await makeRoom({ room_number: 50, building_name: 'A', capacity: 50 });
        await makeRoom({ room_number: 5, building_name: 'A', capacity: 5 });
        const res = await request(app).post('/api/rooms/reserve').send({
            start_time: '2030-01-01T10:00:00',
            end_time: '2030-01-01T11:00:00',
            purpose: 'study',
            std_ids: [s.user_id],
        }).set(authHeader(signTokenFor(s)));
        expect(res.status).toBe(200);
        expect(res.body.room_id).toEqual(expect.any(Number));
        const conn = await getConnection();
        try {
            const rows = await conn.query('SELECT * FROM std_reserve_room WHERE student_id=?', [s.user_id]);
            expect(rows.length).toBe(1);
        } finally {
            await conn.release();
        }
    });

    test('overlapping reservation is rejected with 404', async () => {
        const s = await makeStudent();
        const room = await makeRoom({ room_number: 7, building_name: 'A', capacity: 5 });
        const conn = await getConnection();
        try {
            await conn.query(
                `INSERT INTO std_reserve_room (student_id, room_id, start_time, end_time, purpose, status)
                 VALUES (?, ?, ?, ?, ?, 'confirmed')`,
                [s.user_id, room.room_id, '2030-01-01T10:00:00', '2030-01-01T11:00:00', 'busy']
            );
        } finally {
            await conn.release();
        }
        const res = await request(app).post('/api/rooms/reserve').send({
            start_time: '2030-01-01T10:30:00',
            end_time: '2030-01-01T11:30:00',
            purpose: 'study',
            std_ids: [s.user_id],
        }).set(authHeader(signTokenFor(s)));
        expect(res.status).toBe(404);
    });
});

describe('PATCH /api/rooms/:id/cancel', () => {
    test('400 when start_time missing', async () => {
        const s = await makeStudent();
        const room = await makeRoom();
        const res = await request(app).patch(`/api/rooms/${room.room_id}/cancel`).send({}).set(authHeader(signTokenFor(s)));
        expect(res.status).toBe(400);
    });

    test('404 when no reservation matches (regression guard for to_be_continue.md item 5)', async () => {
        const s = await makeStudent();
        const room = await makeRoom();
        const res = await request(app).patch(`/api/rooms/${room.room_id}/cancel`).send({
            start_time: '2030-01-01T10:00:00',
        }).set(authHeader(signTokenFor(s)));
        expect(res.status).toBe(404);
    });
});

describe('POST /api/rooms/ (admin-only)', () => {
    test('403 for non-admin', async () => {
        const s = await makeStudent();
        const res = await request(app).post('/api/rooms/').send({
            room_number: 100, building_name: 'A', capacity: 10, type: 'theatre',
        }).set(authHeader(signTokenFor(s)));
        expect(res.status).toBe(403);
    });

    test('400 missing fields', async () => {
        const a = await makeAdmin();
        const res = await request(app).post('/api/rooms/').send({ room_number: 1 }).set(authHeader(signTokenFor(a)));
        expect(res.status).toBe(400);
    });

    test('200 valid create', async () => {
        const a = await makeAdmin();
        const res = await request(app).post('/api/rooms/').send({
            room_number: 200, building_name: 'B', capacity: 10, type: 'theatre',
        }).set(authHeader(signTokenFor(a)));
        expect(res.status).toBe(200);
    });
});

describe('POST /api/rooms/resources and GET', () => {
    test('400 when name missing', async () => {
        const s = await makeStudent();
        const res = await request(app).post('/api/rooms/resources').send({}).set(authHeader(signTokenFor(s)));
        expect(res.status).toBe(400);
    });

    test('201 + list lookup', async () => {
        const s = await makeStudent();
        const create = await request(app).post('/api/rooms/resources').send({ name: 'projector' }).set(authHeader(signTokenFor(s)));
        expect(create.status).toBe(201);
        const list = await request(app).get('/api/rooms/resources').set(authHeader(signTokenFor(s)));
        expect(list.status).toBe(200);
        expect(Array.isArray(list.body)).toBe(true);
    });
});
