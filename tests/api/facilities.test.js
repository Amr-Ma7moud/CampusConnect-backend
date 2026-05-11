import { describe, test, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import { makeStudent, makeAdmin, makeFacility } from '../setup/seed.js';
import { signTokenFor, authHeader } from '../setup/tokens.js';

describe('GET /api/facilities/', () => {
    test('200 list', async () => {
        const s = await makeStudent();
        await makeFacility();
        const res = await request(app).get('/api/facilities/').set(authHeader(signTokenFor(s)));
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});

describe('POST /api/facilities/:id/reserve', () => {
    test('403 for admin (student/club_manager only)', async () => {
        const a = await makeAdmin();
        const f = await makeFacility();
        const res = await request(app).post(`/api/facilities/${f.facility_id}/reserve`).send({
            start_time: '2030-01-01T10:00:00', end_time: '2030-01-01T11:00:00', team_ids: [1, 2],
        }).set(authHeader(signTokenFor(a)));
        expect(res.status).toBe(403);
    });

    test('400 missing fields', async () => {
        const s = await makeStudent();
        const f = await makeFacility();
        const res = await request(app).post(`/api/facilities/${f.facility_id}/reserve`).send({}).set(authHeader(signTokenFor(s)));
        expect(res.status).toBe(400);
    });

    test('400 end before start', async () => {
        const s = await makeStudent();
        const f = await makeFacility();
        const res = await request(app).post(`/api/facilities/${f.facility_id}/reserve`).send({
            start_time: '2030-01-01T12:00:00', end_time: '2030-01-01T11:00:00', team_ids: [s.user_id, 9999],
        }).set(authHeader(signTokenFor(s)));
        expect(res.status).toBe(400);
    });

    test('400 current user not in team_ids', async () => {
        const s = await makeStudent();
        const other = await makeStudent();
        const f = await makeFacility({ min_capacity: 1, max_capacity: 3 });
        const res = await request(app).post(`/api/facilities/${f.facility_id}/reserve`).send({
            start_time: '2030-01-01T10:00:00', end_time: '2030-01-01T11:00:00', team_ids: [other.user_id],
        }).set(authHeader(signTokenFor(s)));
        expect(res.status).toBe(400);
    });

    test('404 facility not found', async () => {
        const s = await makeStudent();
        const res = await request(app).post('/api/facilities/99999/reserve').send({
            start_time: '2030-01-01T10:00:00', end_time: '2030-01-01T11:00:00', team_ids: [s.user_id],
        }).set(authHeader(signTokenFor(s)));
        expect(res.status).toBe(404);
    });

    test('201 happy path', async () => {
        const s = await makeStudent();
        const other = await makeStudent();
        const f = await makeFacility({ min_capacity: 2, max_capacity: 4 });
        const res = await request(app).post(`/api/facilities/${f.facility_id}/reserve`).send({
            start_time: '2030-01-01T10:00:00', end_time: '2030-01-01T11:00:00', team_ids: [s.user_id, other.user_id],
        }).set(authHeader(signTokenFor(s)));
        expect(res.status).toBe(201);
    });
});

describe('PATCH /api/facilities/:id', () => {
    test('403 for student', async () => {
        const s = await makeStudent();
        const f = await makeFacility();
        const res = await request(app).patch(`/api/facilities/${f.facility_id}`).send({ name: 'new' }).set(authHeader(signTokenFor(s)));
        expect(res.status).toBe(403);
    });

    test('404 for missing facility (admin)', async () => {
        const a = await makeAdmin();
        const res = await request(app).patch('/api/facilities/99999').send({ name: 'x' }).set(authHeader(signTokenFor(a)));
        expect(res.status).toBe(404);
    });
});

describe('POST /api/facilities/report', () => {
    test('400 missing fields', async () => {
        const s = await makeStudent();
        const res = await request(app).post('/api/facilities/report').send({}).set(authHeader(signTokenFor(s)));
        expect(res.status).toBe(400);
    });

    test('200 with valid data', async () => {
        const s = await makeStudent();
        const f = await makeFacility();
        const res = await request(app).post('/api/facilities/report').send({
            facility_id: f.facility_id, reason: 'leak', details: 'water',
        }).set(authHeader(signTokenFor(s)));
        expect(res.status).toBe(200);
    });
});
