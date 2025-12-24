import { getConnection } from "../config/db.js";

class ClubRepo {
    async createClub({ name, description, email }) {
        let conn;
        try {
            conn = await getConnection();
            const result = await conn.query(
                `INSERT INTO clubs (name, description, email, status) VALUES (?, ?, ?, ?)`,
                [name, description, email, "active"]
            );

            return result.insertId;
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }

    async getAllClubsWithDetails(userId) {
        let conn;
        try {
            conn = await getConnection();
            const rows = await conn.query(`
                SELECT c.*, 
                    (SELECT COUNT(*) FROM club_manager cm WHERE cm.club_id = c.club_id) as followers_count,
                    COUNT(DISTINCT e.event_id) as event_number,
                    COUNT(DISTINCT CASE WHEN e.type = 'session' THEN e.event_id END) as session_number,
                    COUNT(DISTINCT CASE WHEN e.type = 'event' THEN e.event_id END) as real_event_number,
                    (SELECT COUNT(*) FROM posts p WHERE p.club_id = c.club_id) as post_number,
                    (SELECT COUNT(*) FROM std_follow_club WHERE club_id = c.club_id AND student_id = ?) > 0 as is_joined,
                    (SELECT CONCAT(u.first_name, ' ', u.last_name) 
                     FROM club_manager cm 
                     JOIN users u ON cm.student_id = u.user_id 
                     WHERE cm.club_id = c.club_id 
                     LIMIT 1) as club_admin_name
                FROM clubs c
                LEFT JOIN events e ON c.club_id = e.club_id
                GROUP BY c.club_id
            `, [userId]);
            return rows;
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
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
                );
            }
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }

    async findClubByEmail(email) {
        let conn;
        try {
            conn = await getConnection();
            const rows = await conn.query(
                `SELECT * FROM clubs WHERE email = ?`,
                [email]
            );

            return rows[0];
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }

    async findClubById(club_id) {
        let conn;
        try {
            conn = await getConnection();
            const rows = await conn.query(
                `SELECT * FROM clubs WHERE club_id = ?`,
                [club_id]
            );

            return rows[0];
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }

    async findClubMembers(clubId) {
        let conn;
        try {
            conn = await getConnection();
            const rows = await conn.query(
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
            if (conn) conn.release();
        }
    }

    async updateClubDetails(clubId, { name, description, logo, cover }) {
        let conn;
        try {
            conn = await getConnection();
            const fields = [];
            const values = [];

            if (name) {
                fields.push("name = ?");
                values.push(name);
            }
            if (description) {
                fields.push("description = ?");
                values.push(description);
            }
            if (logo) {
                fields.push("logo = ?");
                values.push(logo);
            }
            if (cover) {
                fields.push("cover = ?");
                values.push(cover);
            }

            if (fields.length === 0) {
                return;
            }

            values.push(clubId);

            const sql = `UPDATE clubs SET ${fields.join(
                ", "
            )} WHERE club_id = ?`;
            await conn.query(sql, values);
        } finally {
            if (conn) conn.release();
        }
    }

    async addFollower(clubId, userId) {
        let conn;
        try {
            conn = await getConnection();
            await conn.query(
                `
                INSERT INTO std_follow_club (club_id, student_id)
                VALUES (?, ?)
                `,
                [clubId, userId]
            );
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }

    async deleteFollower(clubId, userId) {
        let conn;
        try {
            conn = await getConnection();
            await conn.query(
                `
                DELETE FROM std_follow_club
                WHERE club_id = ? AND student_id = ?
                `,
                [clubId, userId]
            );
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }

    async getClubFollowers(clubId) {
        let conn;
        try {
            conn = await getConnection();
            const rows = await conn.query(
                `
                SELECT student_id
                FROM std_follow_club
                WHERE club_id = ?
                `,
                [clubId]
            );

            return rows;
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }

    async getAllClubs() {
        let conn;
        try {
            conn = await getConnection();
            const rows = await conn.query(`SELECT * FROM clubs`);

            return rows;
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }

    async getClubIdByManagerId(student_id) {
        let conn;
        try {
            conn = await getConnection();
            const rows = await conn.query(
                `SELECT club_id FROM club_manager WHERE student_id = ?`,
                [student_id]
            );

            if (rows.length === 0) {
                return null;
            }

            return rows[0].club_id;
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }

    async reportClubIssue(reportData) {
        let conn;
        try {
            conn = await getConnection();
            const result = await conn.query(`
                INSERT INTO std_report_club ( student_id, club_id, reason, details)
                VALUES (?, ?, ?, ?)
                `,reportData);
            return result;
        }catch (error) {
            console.log(error);
            throw new Error('Error reporting facility issue: ' + error.message);
        }finally {
            if (conn) conn.release();
        }
    }

    async getAllReports() {
        let conn;
        try {
            conn = await getConnection();
            const rows = await conn.query(`
                SELECT * FROM std_report_club
            `);
            
            return rows;
        }catch (error) {
            console.log(error);
            throw new Error('Error getting reports: ' + error.message);
        }finally {
            if (conn) conn.release();
        }
    }
}

export default new ClubRepo();
