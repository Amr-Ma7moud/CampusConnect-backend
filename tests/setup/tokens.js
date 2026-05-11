import jwt from 'jsonwebtoken';

const SECRET = () => process.env.JWT_SECRET || 'secret_key';

export const signTokenFor = (user, overrides = {}) => {
    const payload = {
        id: user.user_id ?? user.id,
        role: user.role,
        email: user.email,
        ...overrides,
    };
    return jwt.sign(payload, SECRET(), { expiresIn: overrides.expiresIn || '1d' });
};

export const signExpiredToken = (user) => {
    return jwt.sign(
        { id: user.user_id ?? user.id, role: user.role, email: user.email },
        SECRET(),
        { expiresIn: '-1s' }
    );
};

export const signMalformedToken = () => 'not.a.jwt';

export const authHeader = (token) => ({ Authorization: `Bearer ${token}` });
