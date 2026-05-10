import { getConnection } from "../config/db.js";


class PostRepo {
    async createPost(postData) {
        let conn;
        try {
            conn = await getConnection();
            const result = await conn.query(`
                INSERT INTO posts (content, image_url, club_id)
                VALUES (?, ?, ?)
            `, [
                postData.content,
                postData.image_url,
                postData.club_id
            ]);

            return result.insertId;
        } catch (error) {
            throw new Error('Error creating post: ' + error.message);
        } finally {
            if (conn) conn.release();
        }
    }

    async linkPostToEvent(postId, eventId) {
        let conn;
        try {
            conn = await getConnection();
            const result = await conn.query(`
                INSERT INTO posts_for_event (post_id, event_id)
                VALUES (?, ?)
            `, [postId, eventId]);
            return result;
        } catch (error) {
            throw new Error('Error linking post to event: ' + error.message);
        } finally {
            if (conn) conn.release();
        }
    }

    async getPostById(postId) {
        let conn;
        try {
            conn = await getConnection();
            const result = await conn.query(`
                SELECT * FROM posts WHERE post_id = ?
            `, [postId]);

            return result[0];
        } catch (error) {
            throw new Error('Error fetching post: ' + error.message);
        } finally {
            if (conn) conn.release();
        }
    }

    async updatePost(postId, content) {
        let conn;
        try {
            conn = await getConnection();
            const result = await conn.query(`
                UPDATE posts SET content = ? WHERE post_id = ?
            `, [content, postId]);

            return result;
        } catch (error) {
            throw new Error('Error updating post: ' + error.message);
        } finally {
            if (conn) conn.release();
        }
    }

    async insertComment(postId, userId, comment) {
        let conn;
        try {
            conn = await getConnection();
            const result = await conn.query(`
                INSERT INTO std_comment_post (student_id, post_id, content)
                VALUES (?, ?, ?)
            `, [userId, postId, comment]);

            return result.insertId;
        } catch (error) {
            throw new Error('Error inserting comment: ' + error.message);
        } finally {
            if (conn) conn.release();
        }
    }

    async getCommentsByPostId(postId) {
        let conn;
        try {
            conn = await getConnection();
            const result = await conn.query(`
                SELECT 
                    scp.student_id,
                    CONCAT(s.first_name, ' ', s.last_name) as student_name,
                    s.picture as student_image_url,
                    scp.content,
                    scp.created_at
                FROM std_comment_post scp
                JOIN students s ON scp.student_id = s.student_id
                WHERE scp.post_id = ?
                ORDER BY scp.created_at DESC
            `, [postId]);

            return result;
        } catch (error) {
            throw new Error('Error fetching comments: ' + error.message);
        } finally {
            if (conn) conn.release();
        }
    }

    async likePost(postId, userId) {
        let conn;
        try {
            conn = await getConnection();
            const result = await conn.query(`
                INSERT INTO std_like_post (student_id, post_id)
                VALUES (?, ?)
            `, [userId, postId]);

            return result.insertId;
        } catch (error) {
            throw new Error('Error liking post: ' + error.message);
        } finally {
            if (conn) conn.release();
        }
    }

    async unlikePost(postId, userId) {
        let conn;
        try {
            conn = await getConnection();
            const result = await conn.query(`
                DELETE FROM std_like_post WHERE student_id = ? AND post_id = ?
            `, [userId, postId]);

            return result;
        } catch (error) {
            throw new Error('Error unliking post: ' + error.message);
        } finally {
            if (conn) conn.release();
        }
    }

    async getWhoLikedPost(postId) {
        let conn;
        try {
            conn = await getConnection();
            const result = await conn.query(`
                SELECT student_id FROM std_like_post WHERE post_id = ?
            `, [postId]);

            return result;
        } catch (error) {
            throw new Error('Error fetching likes: ' + error.message);
        } finally {
            if (conn) conn.release();
        }
    }

    async getAllPosts(limit) {
        let conn;
        try {
            conn = await getConnection();
            const result = await conn.query(`
                SELECT 
                    p.post_id,
                    p.club_id,
                    p.content,
                    p.image_url,
                    p.created_at,
                    pfe.event_id,
                    COUNT(DISTINCT slp.student_id) as like_count,
                    COUNT(DISTINCT scp.student_id) as comment_count
                FROM posts p
                LEFT JOIN posts_for_event pfe ON p.post_id = pfe.post_id
                LEFT JOIN std_like_post slp ON p.post_id = slp.post_id
                LEFT JOIN std_comment_post scp ON p.post_id = scp.post_id
                GROUP BY p.post_id, p.club_id, p.content, p.image_url, p.created_at, pfe.event_id
                ORDER BY p.created_at DESC 
                LIMIT ?
            `, [limit]
            );

            return result;
        } catch (error) {
            throw new Error('Error fetching posts: ' + error.message);
        } finally {
            if (conn) conn.release();
        }
    }

    async getPostWithAggregates(postId, userId) {
        let conn;
        try {
            conn = await getConnection();
            const result = await conn.query(`
                SELECT 
                    p.post_id,
                    p.club_id,
                    p.content,
                    p.image_url,
                    p.created_at,
                    pfe.event_id,
                    COUNT(DISTINCT slp.student_id) as like_count,
                    COUNT(DISTINCT scp.student_id) as comment_count,
                    MAX(CASE WHEN slp.student_id = ? THEN 1 ELSE 0 END) as is_liked
                FROM posts p
                LEFT JOIN posts_for_event pfe ON p.post_id = pfe.post_id
                LEFT JOIN std_like_post slp ON p.post_id = slp.post_id
                LEFT JOIN std_comment_post scp ON p.post_id = scp.post_id
                WHERE p.post_id = ?
                GROUP BY p.post_id, p.club_id, p.content, p.image_url, p.created_at, pfe.event_id
            `, [userId, postId]);

            return result[0] || null;
        } catch (error) {
            throw new Error('Error fetching post with aggregates: ' + error.message);
        } finally {
            if (conn) conn.release();
        }   
    }

    async getEventIdByPostId(postId) {
        let conn;
        try {
            conn = await getConnection();
            const result = await conn.query(`
                SELECT event_id FROM posts_for_event WHERE post_id = ?
            `, [postId]);

            if (result.length > 0) {
                return result[0].event_id;
            } else {
                return null;
            }
        } catch (error) {
            throw new Error('Error fetching event ID: ' + error.message);
        } finally {
            if (conn) conn.release();
        }   
    }

    async getPostsByEventId(eventId) {
        let conn;
        try {
            conn = await getConnection();
            const result = await conn.query(`
                SELECT 
                    p.post_id,
                    p.club_id,
                    p.content,
                    p.image_url,
                    p.created_at,
                    COUNT(DISTINCT slp.student_id) as like_count,
                    COUNT(DISTINCT scp.student_id) as comment_count
                FROM posts p
                JOIN posts_for_event pe ON p.post_id = pe.post_id
                LEFT JOIN std_like_post slp ON p.post_id = slp.post_id
                LEFT JOIN std_comment_post scp ON p.post_id = scp.post_id
                WHERE pe.event_id = ?
                GROUP BY p.post_id, p.club_id, p.content, p.image_url, p.created_at
                ORDER BY p.created_at DESC
            `, [eventId]);

            return result;
        } catch (error) {
            throw new Error('Error fetching posts for event: ' + error.message);
        } finally {
            if (conn) conn.release();
        }
    }

    async deletePost(postId) {
        let conn;
        try {
            conn = await getConnection();
            const result = await conn.query(`
                DELETE FROM posts WHERE post_id = ?
            `, [postId]);

            return result;
        } catch (error) {
            throw new Error('Error deleting post: ' + error.message);
        } finally {
            if (conn) conn.release();
        }
    }

}

export default new PostRepo();