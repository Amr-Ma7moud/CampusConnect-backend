import { describe, test, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import { makeStudent, makeAdmin, makeClub, makeClubManager } from '../setup/seed.js';
import { signTokenFor, authHeader } from '../setup/tokens.js';
import { getConnection } from '../../src/config/db.js';

describe('POST /api/clubs/', () => {
    test('403 for non-admin', async () => {
        const s = await makeStudent();
        const res = await request(app).post('/api/clubs/').send({
            name: 'X', description: 'd', email: 'x@y.z', std_ids: [1],
        }).set(authHeader(signTokenFor(s)));
        expect(res.status).toBe(403);
    });

    test('400 missing fields', async () => {
        const a = await makeAdmin();
        const res = await request(app).post('/api/clubs/').send({ name: 'x' }).set(authHeader(signTokenFor(a)));
        expect(res.status).toBe(400);
    });

    test('400 empty std_ids', async () => {
        const a = await makeAdmin();
        const res = await request(app).post('/api/clubs/').send({
            name: 'X', description: 'd', email: 'x@y.z', std_ids: [],
        }).set(authHeader(signTokenFor(a)));
        expect(res.status).toBe(400);
    });

    test('201 on create + DB row inserted', async () => {
        const a = await makeAdmin();
        const s = await makeStudent();
        const res = await request(app).post('/api/clubs/').send({
            name: 'Photo', description: 'Photography', email: 'photo@clubs.test', std_ids: [s.user_id],
        }).set(authHeader(signTokenFor(a)));
        expect(res.status).toBe(201);
        const conn = await getConnection();
        try {
            const rows = await conn.query('SELECT * FROM clubs WHERE email=?', ['photo@clubs.test']);
            expect(rows.length).toBe(1);
        } finally {
            await conn.release();
        }
    });

    test('409 duplicate email', async () => {
        const a = await makeAdmin();
        const s = await makeStudent();
        await makeClub({ email: 'dup@clubs.test' });
        const res = await request(app).post('/api/clubs/').send({
            name: 'Dup', description: 'd', email: 'dup@clubs.test', std_ids: [s.user_id],
        }).set(authHeader(signTokenFor(a)));
        expect(res.status).toBe(409);
    });
});

describe('GET /api/clubs/ and /:id', () => {
    test('200 with list', async () => {
        const s = await makeStudent();
        await makeClub();
        const res = await request(app).get('/api/clubs/').set(authHeader(signTokenFor(s)));
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('404 for missing club detail', async () => {
        const s = await makeStudent();
        const res = await request(app).get('/api/clubs/99999').set(authHeader(signTokenFor(s)));
        expect(res.status).toBe(404);
    });
});

describe('POST /api/clubs/:id/follow and DELETE', () => {
    test('follow then unfollow happy path', async () => {
        const s = await makeStudent();
        const club = await makeClub();
        const follow = await request(app).post(`/api/clubs/${club.club_id}/follow`).set(authHeader(signTokenFor(s)));
        expect(follow.status).toBe(200);
        const dup = await request(app).post(`/api/clubs/${club.club_id}/follow`).set(authHeader(signTokenFor(s)));
        expect(dup.status).toBe(409);
        const unfollow = await request(app).delete(`/api/clubs/${club.club_id}/follow`).set(authHeader(signTokenFor(s)));
        expect(unfollow.status).toBe(200);
        const dupUnfollow = await request(app).delete(`/api/clubs/${club.club_id}/follow`).set(authHeader(signTokenFor(s)));
        expect(dupUnfollow.status).toBe(409);
    });

    test('404 follow on non-existent club', async () => {
        const s = await makeStudent();
        const res = await request(app).post('/api/clubs/99999/follow').set(authHeader(signTokenFor(s)));
        expect(res.status).toBe(404);
    });
});

describe('POST /api/clubs/report', () => {
    test('400 missing fields', async () => {
        const s = await makeStudent();
        const res = await request(app).post('/api/clubs/report').send({}).set(authHeader(signTokenFor(s)));
        expect(res.status).toBe(400);
    });

    test('200 on valid report', async () => {
        const s = await makeStudent();
        const club = await makeClub();
        const res = await request(app).post('/api/clubs/report').send({
            club_id: club.club_id, reason: 'bad', details: 'because',
        }).set(authHeader(signTokenFor(s)));
        expect(res.status).toBe(200);
    });
});

describe('PUT /api/clubs/:id', () => {
    test('403 when caller is not manager of this club', async () => {
        const s = await makeStudent();
        const club = await makeClub();
        const token = signTokenFor({ ...s, role: 'club_manager' });
        const res = await request(app).put(`/api/clubs/${club.club_id}`).send({ name: 'new' }).set(authHeader(token));
        expect(res.status).toBe(403);
    });

    test('200 when caller manages this club', async () => {
        const m = await makeClubManager();
        const res = await request(app).put(`/api/clubs/${m.club.club_id}`).send({
            name: 'Updated', description: 'd', logo: null, cover: null,
        }).set(authHeader(signTokenFor(m)));
        expect(res.status).toBe(200);
    });

    test('404 when club does not exist', async () => {
        const a = await makeAdmin();
        const token = signTokenFor(a);
        const res = await request(app).put('/api/clubs/99999').send({ name: 'x' }).set(authHeader(token));
        expect(res.status).toBe(404);
    });
});
