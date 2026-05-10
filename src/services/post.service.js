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
        return await postRepo.getCommentsByPostId(postId);
    }

    async likePost(postId, userId) {
        await postRepo.likePost(postId, userId);
    }

    async unlikePost(postId, userId) {
        await postRepo.unlikePost(postId, userId);
    }

    async getNewsFeed(userId) {
        const posts = await postRepo.getAllPosts(15);
        
        const newsFeed = posts.map(post => ({
            post_id: post.post_id,
            club_id: post.club_id,
            event_id: post.event_id,
            content: post.content,
            image_url: post.image_url,
            created_at: post.created_at,
            like_count: post.like_count,
            comment_count: post.comment_count,
            is_liked: false
        }));

        return newsFeed;
    }

    async getPostDetails(postId, userId) {
        const post = await postRepo.getPostById(postId);
        
        if (!post) {
            throw new Error('Post not found');
        }

        const comments = await this.getCommentsForPost(postId);

        const postData = await postRepo.getPostWithAggregates(postId, userId);

        return {
            post_id: postData.post_id,
            club_id: postData.club_id,
            event_id: postData.event_id,
            content: postData.content,
            image_url: postData.image_url,
            created_at: postData.created_at,
            like_count: postData.like_count,
            comment_count: postData.comment_count,
            is_liked: postData.is_liked === 1,
            comments
        };
    }

    async getPostsByEventId(eventId, userId) {
        const posts = await postRepo.getPostsByEventId(eventId);

        const eventPosts = posts.map(post => ({
            post_id: post.post_id,
            club_id: post.club_id,
            content: post.content,
            image_url: post.image_url,
            created_at: post.created_at,
            like_count: post.like_count,
            comment_count: post.comment_count,
            is_liked: false
        }));

        return eventPosts;
    }

    async deletePost(postId) {
        await postRepo.deletePost(postId);
    }
}

export default new PostService();