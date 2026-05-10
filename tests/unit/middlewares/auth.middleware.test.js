import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { verifyToken, verifyRole } from '../../../src/middlewares/auth.middleware.js';

const SECRET = () => process.env.JWT_SECRET || 'secret_key';

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('auth.middleware', () => {
    describe('verifyToken', () => {
        let res, next;
        beforeEach(() => {
            res = mockRes();
            next = jest.fn();
        });

        test('rejects with 401 when Authorization header is missing', () => {
            const req = { headers: {} };
            verifyToken(req, res, next);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(next).not.toHaveBeenCalled();
        });

        test('rejects with 401 when header does not start with "Bearer "', () => {
            const req = { headers: { authorization: 'Token abc' } };
            verifyToken(req, res, next);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(next).not.toHaveBeenCalled();
        });

        test('rejects with 401 when token signature is invalid', () => {
            const badToken = jwt.sign({ id: 1, role: 'student', email: 'x@y.z' }, 'wrong-secret');
            const req = { headers: { authorization: `Bearer ${badToken}` } };
            verifyToken(req, res, next);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(next).not.toHaveBeenCalled();
        });

        test('rejects with 401 when token is expired', () => {
            const expired = jwt.sign(
                { id: 1, role: 'student', email: 'x@y.z' },
                SECRET(),
                { expiresIn: '-1s' }
            );
            const req = { headers: { authorization: `Bearer ${expired}` } };
            verifyToken(req, res, next);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(next).not.toHaveBeenCalled();
        });

        test('attaches decoded payload to req.user and calls next() for valid token', () => {
            const token = jwt.sign(
                { id: 42, role: 'admin', email: 'a@b.c' },
                SECRET()
            );
            const req = { headers: { authorization: `Bearer ${token}` } };
            verifyToken(req, res, next);
            expect(next).toHaveBeenCalledTimes(1);
            expect(req.user).toMatchObject({ id: 42, role: 'admin', email: 'a@b.c' });
        });
    });

    describe('verifyRole', () => {
        let res, next;
        beforeEach(() => {
            res = mockRes();
            next = jest.fn();
        });

        test('forbids when user role is not in required list', () => {
            const req = { user: { id: 1, role: 'student' } };
            verifyRole(['admin'])(req, res, next);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(next).not.toHaveBeenCalled();
        });

        test('allows when user role matches one of the required roles', () => {
            const req = { user: { id: 1, role: 'club_manager' } };
            verifyRole(['admin', 'club_manager'])(req, res, next);
            expect(next).toHaveBeenCalledTimes(1);
        });

        test('allows when only one role required and matches', () => {
            const req = { user: { id: 5, role: 'admin' } };
            verifyRole(['admin'])(req, res, next);
            expect(next).toHaveBeenCalledTimes(1);
        });

        test('forbids when required list is empty', () => {
            const req = { user: { id: 1, role: 'admin' } };
            verifyRole([])(req, res, next);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(next).not.toHaveBeenCalled();
        });
    });
});
