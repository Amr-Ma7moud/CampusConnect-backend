import e from "express";
import postRepo from "../repositories/post.repository.js";


class PostService {
    async createPost(postData) {

        const postId = await postRepo.createPost(postData);

        if (postData.event_id) {
            await postRepo.linkPostToEvent(postId, postData.event_id);
        }

        return postId;
    }
}

export default new PostService();