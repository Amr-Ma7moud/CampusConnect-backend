import { getConnection } from "../config/db.js";

class UserRepo {
    async createStudent([student_id, faculty, major, level, picture, in_dorms]) {
        let conn;
        try {
            conn = await getConnection();
            

            await conn.query(
                `INSERT INTO students (student_id, faculty, major, level, picture, in_dorms) VALUES (?, ?, ?, ?, ?, ?)`,
                [student_id, faculty, major, level, picture, in_dorms]
            );

            return student_id;
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.end();
        }
    };


    async createUser([first_name, last_name, email, password, user_name, phone, role]) {
        let conn;
        try {
            conn = await getConnection();
            const result = await conn.query(
                `INSERT INTO users (first_name, last_name, email, password, user_name, phone, role) VALUES (?, ?, ?, ?, ?, ?)`,
                [first_name, last_name, email, password, user_name, phone, role]
            );

            return result.insertId;
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.end();
        }
    };

    async createAdmin([admin_id, role]) {
        let conn;
        try {
            conn = await getConnection();

            await conn.query(
                `INSERT INTO admins (admin_id, role) VALUES (?, ?)`,
                [admin_id, role]
            );
            
            return admin_id;
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.end();
        }
    }

    async getStudentById(student_id) {
        let conn;

        try {
            conn = await getConnection();
            
            const result = await conn.query(
                `SELECT u.user_id, u.first_name, u.last_name, u.email, u.user_name, s.faculty, s.major, s.level, s.picture, s.in_dorms, s.type
                 FROM users u
                 JOIN students s ON u.user_id = s.student_id
                 WHERE u.id = ?`,
                [student_id]
            );

            return result[0];
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.end();
        }
    };


    async getAdminById(admin_id) {
        let conn;
        
        try {
            conn = await getConnection();   
            const result = await conn.query(
                `SELECT u.user_id, u.first_name, u.last_name, u.email, u.user_name, a.role
                 FROM users u
                 JOIN admins a ON u.user_id = a.admin_id
                 WHERE u.id = ?`,
                [admin_id]
            );

            return result[0];
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.end();
        }
    };

    async getUserByEmail(email) {
        let conn;
        
        try {
            conn = await getConnection();
            const result = await conn.query(
                `SELECT * FROM users WHERE email = ?`,
                [email]
            );
            return result[0];
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.end();
        }
    };

    async updateUserStatus(userId, status) {
        let conn;
        try {
            conn = await getConnection();
            await conn.query(`
                UPDATE users
                SET is_active = ?
                WHERE user_id = ?
                `, 
                [status, userId]
            );

        } catch (err) {
            throw err;
        } finally {
            if(conn) conn.end();
        }
    }

    async searchForUsers(query) {

        const pattern = `%${query}%`
        let conn;
        try {
            conn = await getConnection();
            const results = await conn.query(
                `SELECT u.user_id, u.first_name, u.last_name, u.email, s.faculty, s.major, u.is_active
                 FROM users u
                 JOIN students s ON u.user_id = s.student_id
                 WHERE u.first_name LIKE ? OR u.last_name LIKE ?`,
                [pattern, pattern]
            );

            return results;
        } catch (err) {
            throw err;
        } finally {
            if(conn) conn.end();
        }
    }
}


export default new UserRepo();