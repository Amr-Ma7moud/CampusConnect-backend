import { describe, test, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import { makeStudent, makeAdmin, makeClubManager, makeClub, makeEvent, makeRoom } from '../setup/seed.js';
import { signTokenFor, authHeader } from '../setup/tokens.js';
import { getConnection } from '../../src/config/db.js';

describe('POST /api/events/', () => {
    test('403 for plain student', async () => {
        const s = await makeStudent();
        const res = await request(app).post('/api/events/').send({ type: 'event', title: 't' }).set(authHeader(signTokenFor(s)));
        expect(res.status).toBe(403);
    });

    test('400 for invalid type', async () => {
        const m = await makeClubManager();
        const res = await request(app).post('/api/events/').send({ type: 'party', title: 't' }).set(authHeader(signTokenFor(m)));
        expect(res.status).toBe(400);
    });
});

describe('POST /api/events/:event_id/register', () => {
    test('404 when event does not exist', async () => {
        const s = await makeStudent();
        const res = await request(app).post('/api/events/99999/register').set(authHeader(signTokenFor(s)));
        expect(res.status).toBe(404);
    });

    test('400 when event id is non-numeric', async () => {
        const s = await makeStudent();
        const res = await request(app).post('/api/events/abc/register').set(authHeader(signTokenFor(s)));
        expect(res.status).toBe(400);
    });

    test('happy path returns 200 and inserts row', async () => {
        const s = await makeStudent();
        const club = await makeClub();
        const event = await makeEvent({ club_id: club.club_id, status: 'scheduled' });
        const res = await request(app).post(`/api/events/${event.event_id}/register`).set(authHeader(signTokenFor(s)));
        expect(res.status).toBe(200);
        const conn = await getConnection();
        try {
            const rows = await conn.query('SELECT * FROM std_register_event WHERE student_id=? AND event_id=?', [s.user_id, event.event_id]);
            expect(rows.length).toBe(1);
        } finally {
            await conn.release();
        }
    });

    test('400 when event status is not scheduled', async () => {
        const s = await makeStudent();
        const club = await makeClub();
        const event = await makeEvent({ club_id: club.club_id, status: 'pending' });
        const res = await request(app).post(`/api/events/${event.event_id}/register`).set(authHeader(signTokenFor(s)));
        expect(res.status).toBe(400);
    });

    test('400 when registration deadline has passed', async () => {
        const s = await makeStudent();
        const club = await makeClub();
        const event = await makeEvent({
            club_id: club.club_id, status: 'scheduled',
            event_start_date: new Date(Date.now() - 3600_000),
            event_end_date: new Date(Date.now() - 1800_000),
        });
        const res = await request(app).post(`/api/events/${event.event_id}/register`).set(authHeader(signTokenFor(s)));
        expect(res.status).toBe(400);
    });

    test('409 when already registered', async () => {
        const s = await makeStudent();
        const club = await makeClub();
        const event = await makeEvent({ club_id: club.club_id, status: 'scheduled' });
        await request(app).post(`/api/events/${event.event_id}/register`).set(authHeader(signTokenFor(s)));
        const res = await request(app).post(`/api/events/${event.event_id}/register`).set(authHeader(signTokenFor(s)));
        expect(res.status).toBe(409);
    });

    test('400 when capacity is reached', async () => {
        const s1 = await makeStudent();
        const s2 = await makeStudent();
        const club = await makeClub();
        const event = await makeEvent({ club_id: club.club_id, status: 'scheduled', max_capacity: 1 });
        const r1 = await request(app).post(`/api/events/${event.event_id}/register`).set(authHeader(signTokenFor(s1)));
        expect(r1.status).toBe(200);
        const r2 = await request(app).post(`/api/events/${event.event_id}/register`).set(authHeader(signTokenFor(s2)));
        expect(r2.status).toBe(400);
    });
});

describe('DELETE /api/events/:event_id/register', () => {
    test('404 when not registered', async () => {
        const s = await makeStudent();
        const club = await makeClub();
        const event = await makeEvent({ club_id: club.club_id, status: 'scheduled' });
        const res = await request(app).delete(`/api/events/${event.event_id}/register`).set(authHeader(signTokenFor(s)));
        expect(res.status).toBe(404);
    });

    test('200 when cancelling existing registration', async () => {
        const s = await makeStudent();
        const club = await makeClub();
        const event = await makeEvent({ club_id: club.club_id, status: 'scheduled' });
        await request(app).post(`/api/events/${event.event_id}/register`).set(authHeader(signTokenFor(s)));
        const res = await request(app).delete(`/api/events/${event.event_id}/register`).set(authHeader(signTokenFor(s)));
        expect(res.status).toBe(200);
    });
});

describe('POST /api/events/:id/attendance', () => {
    // KNOWN-BROKEN per to_be_continue.md (route/controller mismatch).
    // Now uses req.body.student_id; failing test will catch any regression in role semantics.
    test('400 when student_id missing in body (regression guard from to_be_continue.md)', async () => {
        const m = await makeClubManager();
        const club = m.club;
        const event = await makeEvent({ club_id: club.club_id, status: 'scheduled' });
        const res = await request(app).post(`/api/events/${event.event_id}/attendance`).send({}).set(authHeader(signTokenFor(m)));
        // Controller currently 500s in this case — failing test is intentional.
        expect([400, 404]).toContain(res.status);
    });
});

describe('GET /api/events/', () => {
    test('returns 200 array of approved events', async () => {
        const s = await makeStudent();
        const club = await makeClub();
        await makeEvent({ club_id: club.club_id, status: 'scheduled', type: 'event' });
        await makeEvent({ club_id: club.club_id, status: 'scheduled', type: 'session' });
        const res = await request(app).get('/api/events/').set(authHeader(signTokenFor(s)));
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('400 for invalid type query param', async () => {
        const s = await makeStudent();
        const res = await request(app).get('/api/events/?type=party').set(authHeader(signTokenFor(s)));
        expect(res.status).toBe(400);
    });

    test('filtering by type=event returns only event-type rows (regression guard for to_be_continue.md item 1)', async () => {
        const s = await makeStudent();
        const club = await makeClub();
        await makeEvent({ club_id: club.club_id, status: 'scheduled', type: 'event' });
        await makeEvent({ club_id: club.club_id, status: 'scheduled', type: 'session' });
        const res = await request(app).get('/api/events/?type=event').set(authHeader(signTokenFor(s)));
        expect(res.status).toBe(200);
        // Known issue: filter currently returns empty results — this test will fail until fixed.
        expect(res.body.length).toBeGreaterThanOrEqual(1);
        for (const e of res.body) expect(e.type).toBe('event');
    });
});

describe('GET /api/events/:event_id', () => {
    test('200 for existing event', async () => {
        const s = await makeStudent();
        const club = await makeClub();
        const event = await makeEvent({ club_id: club.club_id, status: 'scheduled' });
        const res = await request(app).get(`/api/events/${event.event_id}`).set(authHeader(signTokenFor(s)));
        expect(res.status).toBe(200);
    });

    test('404 for missing event', async () => {
        const s = await makeStudent();
        const res = await request(app).get('/api/events/99999').set(authHeader(signTokenFor(s)));
        expect(res.status).toBe(404);
    });
});

describe('POST /api/events/report', () => {
    test('400 when fields missing', async () => {
        const s = await makeStudent();
        const res = await request(app).post('/api/events/report').send({}).set(authHeader(signTokenFor(s)));
        expect(res.status).toBe(400);
    });

    test('200 on valid report', async () => {
        const s = await makeStudent();
        const club = await makeClub();
        const event = await makeEvent({ club_id: club.club_id, status: 'scheduled' });
        const res = await request(app).post('/api/events/report')
            .send({ event_id: event.event_id, reason: 'noise', details: 'too loud' })
            .set(authHeader(signTokenFor(s)));
        expect(res.status).toBe(200);
    });
});
