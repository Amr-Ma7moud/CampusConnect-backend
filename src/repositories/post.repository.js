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
                    CONCAT(u.first_name, ' ', u.last_name) as student_name,
                    st.picture as student_image_url,
                    scp.content,
                    scp.created_at
                FROM std_comment_post scp
                JOIN users u ON scp.student_id = u.user_id
                LEFT JOIN students st ON scp.student_id = st.student_id
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

    async getAllPosts(limit, userId) {
        let conn;
        try {
            conn = await getConnection();
            const result = await conn.query(`
                SELECT 
                    CAST(p.post_id AS UNSIGNED) as post_id,
                    CAST(p.club_id AS UNSIGNED) as club_id,
                    p.content,
                    p.image_url,
                    p.created_at,
                    CAST(COALESCE(pfe.event_id, 0) AS UNSIGNED) as event_id,
                    (SELECT COUNT(*) FROM std_like_post WHERE post_id = p.post_id) as like_count,
                    (SELECT COUNT(*) FROM std_comment_post WHERE post_id = p.post_id) as comment_count,
                    EXISTS(SELECT 1 FROM std_like_post WHERE post_id = p.post_id AND student_id = ?) as is_liked
                FROM posts p
                LEFT JOIN posts_for_event pfe ON p.post_id = pfe.post_id
                ORDER BY p.created_at DESC 
                LIMIT ?
            `, [userId, limit]
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
                    CAST(p.post_id AS UNSIGNED) as post_id,
                    CAST(p.club_id AS UNSIGNED) as club_id,
                    p.content,
                    p.image_url,
                    p.created_at,
                    CAST(COALESCE(pfe.event_id, 0) AS UNSIGNED) as event_id,
                    CAST(COALESCE(lc.like_count, 0) AS UNSIGNED) as like_count,
                    CAST(COALESCE(cc.comment_count, 0) AS UNSIGNED) as comment_count,
                    COALESCE(ui.is_liked, 0) as is_liked
                FROM posts p
                LEFT JOIN posts_for_event pfe ON p.post_id = pfe.post_id
                LEFT JOIN (SELECT post_id, COUNT(*) as like_count FROM std_like_post GROUP BY post_id) lc ON p.post_id = lc.post_id
                LEFT JOIN (SELECT post_id, COUNT(*) as comment_count FROM std_comment_post GROUP BY post_id) cc ON p.post_id = cc.post_id
                LEFT JOIN (SELECT post_id, 1 as is_liked FROM std_like_post WHERE student_id = ?) ui ON p.post_id = ui.post_id
                WHERE p.post_id = ?
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
                SELECT CAST(event_id AS UNSIGNED) as event_id FROM posts_for_event WHERE post_id = ?
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
                    CAST(p.post_id AS UNSIGNED) as post_id,
                    CAST(p.club_id AS UNSIGNED) as club_id,
                    p.content,
                    p.image_url,
                    p.created_at,
                    CAST(COALESCE(lc.like_count, 0) AS UNSIGNED) as like_count,
                    CAST(COALESCE(cc.comment_count, 0) AS UNSIGNED) as comment_count
                FROM posts p
                JOIN posts_for_event pe ON p.post_id = pe.post_id
                LEFT JOIN (SELECT post_id, COUNT(*) as like_count FROM std_like_post GROUP BY post_id) lc ON p.post_id = lc.post_id
                LEFT JOIN (SELECT post_id, COUNT(*) as comment_count FROM std_comment_post GROUP BY post_id) cc ON p.post_id = cc.post_id
                WHERE pe.event_id = ?
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