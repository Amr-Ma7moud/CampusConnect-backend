import authRepository from '../repositories/auth.repository.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import clubService from './club.service.js';

class AuthService {
    async login(email, password) {
        const user = await authRepository.findUserByEmail(email);

        if (!user) {
            throw new Error('User record corrupted. Please contact support.');
        }

        if(user.role === "student") {
            const clubId = await clubService.getClubIdByManagerId(user?.user_id);
            if(clubId) {
                user.role = "club_manager";
            }
        }
        

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid email or password');
        }

        const token = jwt.sign(
            { 
                id: user.user_id, 
                role: user.role, 
                email: user.email     
            },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '1d' }
        );

        return {
            token,
            user: {
                id: user.user_id.toString(),
                email: user.email,
                role: user.role,
                first_name: user.first_name,
                last_name: user.last_name,
                user_name: user.user_name
            }
        };
    }
}

export default new AuthService();