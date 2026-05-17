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
        const posts = await postRepo.getAllPosts(15, userId);
        
        const newsFeed = posts.map(post => ({
            post_id: Number(post.post_id),
            club_id: Number(post.club_id),
            event_id: post.event_id ? Number(post.event_id) : null,
            content: post.content,
            image_url: post.image_url,
            created_at: post.created_at,
            like_count: Number(post.like_count),
            comment_count: Number(post.comment_count),
            is_liked: post.is_liked >= 1
        }));

        return newsFeed;
    }

    async getPostsByClubId(clubId, userId) {
        const posts = await postRepo.getPostsByClubId(clubId, userId, 15);
        const clubPosts = posts.map(post => ({
            post_id: Number(post.post_id),
            club_id: Number(post.club_id),
            event_id: post.event_id ? Number(post.event_id) : null,
            content: post.content,
            image_url: post.image_url,
            created_at: post.created_at,
            like_count: Number(post.like_count),
            comment_count: Number(post.comment_count),
            is_liked: post.is_liked === 1
        }));
    }

    async getPostDetails(postId, userId) {
        const [postData, comments] = await Promise.all([
            postRepo.getPostWithAggregates(postId, userId),
            this.getCommentsForPost(postId)
        ]);
        
        if (!postData) {
            throw new Error('Post not found');
        }

        return {
            post_id: Number(postData.post_id),
            club_id: Number(postData.club_id),
            event_id: postData.event_id ? Number(postData.event_id) : null,
            content: postData.content,
            image_url: postData.image_url,
            created_at: postData.created_at,
            like_count: Number(postData.like_count),
            comment_count: Number(postData.comment_count),
            is_liked: postData.is_liked === 1,
            comments
        };
    }

    async getPostsByEventId(eventId, userId) {
        const posts = await postRepo.getPostsByEventId(eventId);

        const eventPosts = posts.map(post => ({
            post_id: Number(post.post_id),
            club_id: Number(post.club_id),
            content: post.content,
            image_url: post.image_url,
            created_at: post.created_at,
            like_count: Number(post.like_count),
            comment_count: Number(post.comment_count),
            is_liked: false
        }));

        return eventPosts;
    }

    async deletePost(postId) {
        await postRepo.deletePost(postId);
    }
}

export default new PostService();