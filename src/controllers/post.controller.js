import clubService from "../services/club.service.js";
import postService from "../services/post.service.js";

export const createPost = async (req, res) => {
    const userId = req.user.id;
    const { event_id, content, image_url } = req.body;

    try {
         if(!content) {
            return res.status(400).json({ message: 'Content is required' });
        }

        const clubId = clubService.getClubIdByManagerId(userId);

        if(!clubId) {
            return res.status(403).json(
                { 
                    message: 'forbidden',
                    details: 'the user is not a manager of any club'
                }
            )
        }

        const postData = {
            content,
            image_url,
            club_id: clubId,
            event_id
        };

        await postService.createPost(postData);

        return res.status(201).json({ message: 'Post created successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};

export const editPost = async (req, res) => {

    const userId = req.user.id;
    const {new_content} = req.body;
    const postId = req.params.post_id;

    try {
        if(!new_content) {
            return res.status(400).json({ message: 'Content is required' });
        }

        const clubId = clubService.getClubIdByManagerId(userId);

        if(!clubId) {
            return res.status(403).json(
                { 
                    message: 'forbidden',
                    details: 'the user is not a manager of any club'
                    }
            )
        }

        if(!await postService.checkIfPostBelongsToClub(postId, clubId)) {
            return res.status(403).json(
                { 
                    message: 'forbidden',
                    details: 'the post does not belong to the club managed by the user'
                    }
            )
        }

        await postService.updatePost(postId, new_content);

        return res.status(200).json({ message: 'Post updated successfully' });

    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', details: error.message });
    }

};

export const addCommentToPost = async (req, res) => {
    const userId = req.user.id;
    const postId = req.params.id;
    const { comment } = req.body;

    if(!comment) {
        return res.status(400).json({ message: 'Comment is required' });
    }

    try {
        await postService.addCommentToPost(postId, userId, comment);
        return res.status(200).json({ message: 'Comment added successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', details: error.message });
    }
}


export const getPostComments = async (req, res) => {
    const postId = req.params.id;

    try {
        if(!await postService.getPostById(postId)) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const comments = await postService.getCommentsForPost(postId);
        return res.status(200).json({ comments });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};

export const likePost = async (req, res) => {
    const userId = req.user.id;
    const postId = req.params.id;

    try {
        await postService.likePost(postId, userId);
        return res.status(200).json({ message: 'Post liked successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};

export const unlikePost = async (req, res) => {
    const userId = req.user.id;
    const postId = req.params.id;

    try {
        await postService.unlikePost(postId, userId);
        return res.status(200).json({ message: 'Post unliked successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', details: error.message });
    }

}
export const getNewsFeed = async (req, res) => {
    try {

    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};