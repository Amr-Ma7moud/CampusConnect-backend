import e from "express";
import postRepo from "../repositories/post.repository.js";
import userService from "./user.service.js";


class PostService {
    async createPost(postData) {

        const postId = await postRepo.createPost(postData);

        if (postData.event_id) {
            await postRepo.linkPostToEvent(postId, postData.event_id);
        }

        return postId;
    }

    async getPostById(postId) {
        const post = await postRepo.getPostById(postId);
        return post;
    }

    async checkIfPostBelongsToClub(postId, clubId) {
        const post = await postRepo.getPostById(postId);
        return post && post.club_id === clubId;
    }

    async updatePost(postId, content) {
        await postRepo.updatePost(postId, content);
    }

    async addCommentToPost(postId, userId, comment) {
        await postRepo.insertComment(postId, userId, comment);
    }

    async getCommentsForPost(postId) {
        const comments = await postRepo.getCommentsByPostId(postId);

        let postComments = [];

        for (let comment of comments) {
            const student = await userService.getStudentById(comment.student_id);

            postComments.push({
                student_name: `${student.first_name} ${student.last_name}`,
                student_image_url: student.picture,
                content: comment.content,
                created_at: comment.created_at
            });
        }

        return postComments;
    }

    async likePost(postId, userId) {
        await postRepo.likePost(postId, userId);
    }

    async unlikePost(postId, userId) {
        await postRepo.unlikePost(postId, userId);
    }

    async getNewsFeed(userId) {
        const posts = await postRepo.getAllPosts(15);
        
        let newsFeed = [];

        for(let post of posts) {
            const comments = await this.getCommentsForPost(post.post_id);
            const likes = await postRepo.getWhoLikedPost(post.post_id);
            const eventId = await postRepo.getEventIdByPostId(post.post_id);

            newsFeed.push({
                post_id: post.post_id,
                club_id: post.club_id,
                event_id: eventId,
                content: post.content,
                image_url: post.image_url,
                created_at: post.created_at,
                like_count: likes.length,
                comment_count: comments.length,
                is_liked: likes.some(like => like.student_id === userId),
            });
        }

        return newsFeed;
    }
}

export default new PostService();