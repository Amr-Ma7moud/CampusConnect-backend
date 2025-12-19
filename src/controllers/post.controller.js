import clubService from "../services/club.service.js";
import postService from "../services/post.service.js";

export const createPost = async (req, res) => {
    const userId = req.user.id;
    const { event_id, content, image_url } = req.body;

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
};

export const editPost = async (req, res) => {

    const userId = req.user.id;
    const {content} = req.body;
    const postId = req.params.post_id;

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

        if(!await postService.checkIfPostBelongsToClub(postId, clubId)) {
            return res.status(403).json(
                { 
                    message: 'forbidden',
                    details: 'the post does not belong to the club managed by the user'
                    }
            )
        }

        await postService.updatePost(postId, content);

        return res.status(200).json({ message: 'Post updated successfully' });
        
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', details: error.message });
    }

};