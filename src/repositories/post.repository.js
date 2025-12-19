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
            if (conn) conn.end();
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
            if (conn) conn.end();
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
            if (conn) conn.end();
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
            if (conn) conn.end();
        }
    }

    async insertComment(postId, userId, comment) {
        let conn;
        try {
            conn = await getConnection();
            const result = await conn.query(`
                INSERT INTO std_comment_post (student_id, post_id, comment)
                VALUES (?, ?, ?)
            `, [userId, postId, comment]);

            return result.insertId;
        } catch (error) {
            throw new Error('Error inserting comment: ' + error.message);
        } finally {
            if (conn) conn.end();
        }
    }

    async getCommentsByPostId(postId) {
        let conn;
        try {
            conn = await getConnection();
            const result = await conn.query(`
                SELECT * FROM std_comment_post WHERE post_id = ?
            `, [postId]);

            return result;
        } catch (error) {
            throw new Error('Error fetching comments: ' + error.message);
        } finally {
            if (conn) conn.end();
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
            if (conn) conn.end();
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
            if (conn) conn.end();
        }
    }

    async getAllPosts(limit) {
        let conn;
        try {
            conn = await getConnection();
            const result = await conn.query(`
                SELECT * FROM posts LIMIT ?
            `, [limit]
            );

            return result;
        } catch (error) {
            throw new Error('Error fetching posts: ' + error.message);
        } finally {
            if (conn) conn.end();
        }
    }
}

export default new PostRepo();