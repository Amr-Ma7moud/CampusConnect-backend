import authRepository from '../repositories/auth.repository.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

class AuthService {
    async login(email, password) {
        const user = await authRepository.findUserByEmail(email);

        if (!user) {
            throw new Error('User record corrupted. Please contact support.');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid email or password');
        }

        const token = jwt.sign(
            { 
                id: user.id, 
                role: user.role, 
                email: user.email     
            },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '1d' }
        );

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        };
    }
}

export default new AuthService();