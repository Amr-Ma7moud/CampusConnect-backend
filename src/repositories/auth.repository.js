import { getConnection } from '../config/db.js';

class AuthRepository {
    async findUserByEmail(email) {
        let conn;
        try {
            conn = await getConnection();
            const rows = await conn.query(
                `SELECT user_id, email, password, 'user' as role_group
                 FROM users WHERE email = ?`,
                [email]
            );
            return rows[0];
        }
        catch (err) {
            throw err;
        }
        finally {
            if (conn) conn.end();
        }
    }
}

export default new AuthRepository();