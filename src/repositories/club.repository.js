

class ClubRepo {

    async createClub({ name, description, email }) {
        let conn;
        try {
            conn = await getConnection();
            const result = await conn.query(
                `INSERT INTO clubs (name, description, email, status) VALUES (?, ?, ?)`,
                [name, description, email, 'active']
            );

            return result.insertId;
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.end();
        }
    }

    async addMembersToClub(clubId, stdIds) {
        let conn;
        try {
            conn = await getConnection();
            
            for (const stdId of stdIds) {
                const student_id = stdId.id;
                const role_title = stdId.role_title;

                await conn.query(
                    `
                    INSERT INTO club_manager (student_id, club_id, role_title)
                    VALUES (?, ?, ?)
                    `,
                    [student_id, clubId, role_title]
                )
            }

        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.end();
        }
    }

    async findClubByEmail(email) {
        let conn;
        try {
            conn = await getConnection();
            const [rows] = await conn.query(
                `SELECT * FROM clubs WHERE email = ?`,
                [email]
            );

            return rows[0];
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.end();
        }
    }

    async findClubById(id) {
        let conn;
        try {
            conn = await getConnection();
            const [rows] = await conn.query(
                `SELECT * FROM clubs WHERE club_id = ?`,
                [id]
            );

            return rows[0];
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.end();
        }
    }

    async findClubMembers(clubId) {
        let conn;
        try {
            conn = await getConnection();
            const [rows] = await conn.query(
                `
                SELECT cm.student_id, u.first_name, u.last_name, cm.role_title
                FROM club_manager cm
                JOIN users u ON cm.student_id = u.user_id
                WHERE cm.club_id = ?
                `,
                [clubId]
            );

            return rows;
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.end();
        }
    }

    async updateClubDetails(clubId, { name, description, logo, cover }) {
        let conn;
        try {
            conn = await getConnection();
            const fields = [];
            const values = [];

            if (name) {
                fields.push('name = ?');
                values.push(name);
            }
            if (description) {
                fields.push('description = ?');
                values.push(description);
            }
            if (logo) {
                fields.push('logo = ?');
                values.push(logo);
            }
            if (cover) {
                fields.push('cover = ?');
                values.push(cover);
            }

            if (fields.length === 0) {
                return;
            }

            values.push(clubId);

            const sql = `UPDATE clubs SET ${fields.join(', ')} WHERE club_id = ?`;
            await conn.query(sql, values);
        } finally {
            if (conn) conn.end();
        }
    }

};

export default new ClubRepo();