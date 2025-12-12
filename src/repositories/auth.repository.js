import { getConnection } from '../config/db.js';

class AuthRepository {
    async getUserType(email) {
        let conn;
        try {
            conn = await getConnection();
            const rows = await conn.query(
                `SELECT type FROM user_type WHERE email = ?`, 
                [email]
            );
            return rows[0];
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.end();
        }
    }

    async findStudentByEmail(email) {
        let conn;
        try {
            conn = await getConnection();
            const rows = await conn.query(
                `SELECT student_id, email, password, type, 'student' as role_group 
                 FROM students WHERE email = ?`, 
                [email]
            );
            return rows[0];
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.end();
        }
    }

    async findAdminByEmail(email) {
        let conn;
        try {
            conn = await getConnection();
            const rows = await conn.query(
                `SELECT admin_id, email, password, role, 'admin' as role_group 
                 FROM admins WHERE email = ?`, 
                [email]
            );
            return rows[0];
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.end();
        }
    }
}

export default new AuthRepository();