import { describe, test, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import {
    makeStudent,
    makeAdmin,
    makeClub,
    makeClubManager,
    makePost,
} from '../setup/seed.js';
import { signTokenFor, authHeader } from '../setup/tokens.js';
import { getConnection } from '../../src/config/db.js';

let __sec = 0;
const sec = (prefix) => `${prefix}_${Date.now()}_${++__sec}@sec.test.local`;

describe('Security: SQL injection', () => {
    test('login email field with classic OR 1=1 payload does not bypass auth', async () => {
        const email = sec('victim');
        await makeStudent({ email, password: 'Correct1!' });
        const res = await request(app).post('/api/auth/login').send({
            email: "' OR '1'='1",
            password: "' OR '1'='1",
        });
        expect(res.status).toBe(401);
        expect(res.body.token).toBeUndefined();
    });

    test('login email field with comment-terminator payload does not bypass auth', async () => {
        const email = sec('victim');
        await makeStudent({ email, password: 'Correct1!' });
        const res = await request(app).post('/api/auth/login').send({
            email: `${email}'-- `,
            password: 'anything',
        });
        expect(res.status).toBe(401);
        expect(res.body.token).toBeUndefined();
    });

    test('path-param injection payload cannot drop the clubs table (parameterised queries)', async () => {
        const s = await makeStudent();
        const malicious = encodeURIComponent("1; DROP TABLE clubs; --");
        await request(app)
            .get(`/api/clubs/${malicious}`)
            .set(authHeader(signTokenFor(s)));

        const conn = await getConnection();
        try {
            const rows = await conn.query("SHOW TABLES LIKE 'clubs'");
            expect(rows.length).toBe(1);
        } finally {
            await conn.release();
        }
    });

    test('injection payload as a club name is stored verbatim, not executed (parameterised inserts)', async () => {
        const payload = "Drama'); DROP TABLE clubs; --";
        const club = await makeClub({ name: payload });

        const conn = await getConnection();
        try {
            const rows = await conn.query('SELECT name FROM clubs WHERE club_id = ?', [club.club_id]);
            expect(rows.length).toBe(1);
            expect(rows[0].name).toBe(payload);
            const stillExists = await conn.query("SHOW TABLES LIKE 'clubs'");
            expect(stillExists.length).toBe(1);
        } finally {
            await conn.release();
        }
    });
});

describe('Security: XSS (stored)', () => {
    test('post content with <script> payload is stored exactly as submitted, not executed or stripped silently', async () => {
        const club = await makeClub();
        const xss = "<script>alert('xss')</script>";
        const post = await makePost({ club_id: club.club_id, content: xss });

        const conn = await getConnection();
        try {
            const rows = await conn.query('SELECT content FROM posts WHERE post_id = ?', [post.post_id]);
            expect(rows.length).toBe(1);
            expect(rows[0].content).toBe(xss);
        } finally {
            await conn.release();
        }
    });

    test('GET post returns XSS payload as JSON (Content-Type prevents browser execution)', async () => {
        const s = await makeStudent();
        const club = await makeClub();
        const xss = '<img src=x onerror=alert(1)>';
        const post = await makePost({ club_id: club.club_id, content: xss });
        const res = await request(app)
            .get(`/api/posts/${post.post_id}`)
            .set(authHeader(signTokenFor(s)));
        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toMatch(/application\/json/);
        expect(res.headers['content-type']).not.toMatch(/text\/html/);
        expect(JSON.stringify(res.body)).toContain(xss);
    });

    test('comment with XSS payload is round-tripped as JSON, not as HTML', async () => {
        const s = await makeStudent();
        const club = await makeClub();
        const post = await makePost({ club_id: club.club_id });
        const xss = "</script><script>steal()</script>";
        const add = await request(app)
            .post(`/api/posts/${post.post_id}/comments`)
            .send({ comment: xss })
            .set(authHeader(signTokenFor(s)));
        expect(add.status).toBe(200);

        const get = await request(app)
            .get(`/api/posts/${post.post_id}/comments`)
            .set(authHeader(signTokenFor(s)));
        expect(get.status).toBe(200);
        expect(get.headers['content-type']).toMatch(/application\/json/);
    });
});

describe('Security: IDOR / authorization boundaries', () => {
    test('club_manager cannot edit a club they do not manage (cross-club PUT)', async () => {
        const m = await makeClubManager();
        const otherClub = await makeClub();
        const res = await request(app)
            .put(`/api/clubs/${otherClub.club_id}`)
            .send({ name: 'hacked', description: 'x', logo: null, cover: null })
            .set(authHeader(signTokenFor(m)));
        expect(res.status).toBe(403);

        const conn = await getConnection();
        try {
            const rows = await conn.query('SELECT name FROM clubs WHERE club_id = ?', [otherClub.club_id]);
            expect(rows[0].name).not.toBe('hacked');
        } finally {
            await conn.release();
        }
    });

    test('club_manager cannot edit a post that belongs to another club', async () => {
        const m = await makeClubManager();
        const otherClub = await makeClub();
        const foreignPost = await makePost({ club_id: otherClub.club_id, content: 'original' });
        const res = await request(app)
            .put(`/api/posts/${foreignPost.post_id}`)
            .send({ new_content: 'tampered' })
            .set(authHeader(signTokenFor(m)));
        expect(res.status).toBe(403);

        const conn = await getConnection();
        try {
            const rows = await conn.query('SELECT content FROM posts WHERE post_id = ?', [foreignPost.post_id]);
            expect(rows[0].content).toBe('original');
        } finally {
            await conn.release();
        }
    });

    test('student cannot promote themselves by sending a forged role in the login body', async () => {
        const email = sec('climber');
        const s = await makeStudent({ email });
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email, password: s._plainPassword, role: 'admin' });
        expect(res.status).toBe(200);
        expect(res.body.user.role).toBe('student');
    });

    test('forged JWT signed with wrong secret is rejected on admin endpoint', async () => {
        const jwt = (await import('jsonwebtoken')).default;
        const forged = jwt.sign(
            { id: 1, role: 'admin', email: 'attacker@sec.test.local' },
            'definitely-not-the-real-secret',
            { expiresIn: '1d' },
        );
        const res = await request(app)
            .get('/api/admin/stats')
            .set(authHeader(forged));
        expect(res.status).toBe(401);
    });

    test('student role in JWT cannot reach admin-only POST endpoints (defence-in-depth)', async () => {
        const s = await makeStudent();
        const res = await request(app)
            .post('/api/admin/users')
            .send({ first_name: 'X', last_name: 'Y', email: sec('idor'), password: 'p', user_name: 'u', phone: '1', role: 'admin' })
            .set(authHeader(signTokenFor(s)));
        expect(res.status).toBe(403);
    });
});
