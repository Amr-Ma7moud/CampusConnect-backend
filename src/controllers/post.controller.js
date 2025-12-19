import clubService from "../services/club.service.js";
import postService from "../services/post.service.js";

export const createPost = async (req, res) => {
    const userId = req.user.id;
    const { event_id, content, image_url } = req.body;

    if(!content) {
        return res.status(400).json({ message: 'Content is required' });
    }

    const clubId = clubService.getClubIdByManagerId(userId);

    const postData = {
        content,
        image_url,
        club_id: clubId,
        event_id
    };

    await postService.createPost(postData);
};