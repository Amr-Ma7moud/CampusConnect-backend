import { describe, test, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import { makeStudent, makeAdmin } from '../setup/seed.js';
import { signTokenFor, authHeader } from '../setup/tokens.js';

describe('GET /api/reservations/', () => {
    test('401 without token', async () => {
        const res = await request(app).get('/api/reservations/');
        expect(res.status).toBe(401);
    });

    test('403 for admin (students only)', async () => {
        const a = await makeAdmin();
        const res = await request(app).get('/api/reservations/').set(authHeader(signTokenFor(a)));
        expect(res.status).toBe(403);
    });

    test('200 returns array for student', async () => {
        const s = await makeStudent();
        const res = await request(app).get('/api/reservations/').set(authHeader(signTokenFor(s)));
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});
