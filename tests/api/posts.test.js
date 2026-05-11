import { describe, test, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import { makeStudent, makeAdmin, makeClub, makeClubManager, makePost } from '../setup/seed.js';
import { signTokenFor, authHeader } from '../setup/tokens.js';

describe('POST /api/posts/', () => {
    // Known-broken per to_be_continue.md item 4: controller uses `clubId.userId.toString()` which throws.
    test('club_manager creating a post should succeed with 201 (regression guard)', async () => {
        const m = await makeClubManager();
        const res = await request(app).post('/api/posts/').send({
            content: 'Hello world',
        }).set(authHeader(signTokenFor(m)));
        // The controller currently crashes on `clubId.userId.toString()` — failing test until fixed.
        expect(res.status).toBe(201);
    });

    test('403 when caller is not manager of any club', async () => {
        const fakeMgr = { user_id: 1, role: 'club_manager', email: 'x@y' };
        const res = await request(app).post('/api/posts/').send({ content: 'x' }).set(authHeader(signTokenFor(fakeMgr)));
        expect(res.status).toBe(403);
    });

    test('400 when content missing', async () => {
        const m = await makeClubManager();
        const res = await request(app).post('/api/posts/').send({}).set(authHeader(signTokenFor(m)));
        expect(res.status).toBe(400);
    });

    test('403 for plain student', async () => {
        const s = await makeStudent();
        const res = await request(app).post('/api/posts/').send({ content: 'x' }).set(authHeader(signTokenFor(s)));
        expect(res.status).toBe(403);
    });
});

describe('GET /api/posts/', () => {
    test('200 news feed', async () => {
        const s = await makeStudent();
        const club = await makeClub();
        await makePost({ club_id: club.club_id });
        const res = await request(app).get('/api/posts/').set(authHeader(signTokenFor(s)));
        expect(res.status).toBe(200);
        expect(res.body.newsFeed).toEqual(expect.any(Array));
    });
});

describe('POST /api/posts/:id/like and DELETE', () => {
    test('like and unlike happy path', async () => {
        const s = await makeStudent();
        const club = await makeClub();
        const p = await makePost({ club_id: club.club_id });
        const like = await request(app).post(`/api/posts/${p.post_id}/like`).set(authHeader(signTokenFor(s)));
        expect(like.status).toBe(200);
        const unlike = await request(app).delete(`/api/posts/${p.post_id}/like`).set(authHeader(signTokenFor(s)));
        expect(unlike.status).toBe(200);
    });
});

describe('POST /api/posts/:id/comments', () => {
    test('400 when comment empty', async () => {
        const s = await makeStudent();
        const club = await makeClub();
        const p = await makePost({ club_id: club.club_id });
        const res = await request(app).post(`/api/posts/${p.post_id}/comments`).send({}).set(authHeader(signTokenFor(s)));
        expect(res.status).toBe(400);
    });

    test('200 adds comment', async () => {
        const s = await makeStudent();
        const club = await makeClub();
        const p = await makePost({ club_id: club.club_id });
        const res = await request(app).post(`/api/posts/${p.post_id}/comments`).send({ comment: 'nice' }).set(authHeader(signTokenFor(s)));
        expect(res.status).toBe(200);
    });
});
