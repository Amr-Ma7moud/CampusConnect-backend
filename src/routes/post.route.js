import express from 'express';
import { verifyRole } from '../middlewares/auth.middleware.js';
import { addCommentToPost, createPost, editPost, getNewsFeed, getPostComments, likePost, unlikePost } from '../controllers/post.controller.js';

const router = express.Router();


router.post('/', verifyRole['club_manager', 'admin'], createPost);
// router.delete('/:post_id', verifyRole['club_manager', 'admin'], );
router.put('/:post_id', verifyRole['club_manager', 'admin'], editPost);
router.get('/', getNewsFeed);
router.post('/:id/like', likePost);
router.delete('/:id/like', unlikePost);
router.post('/:id/comments', addCommentToPost);
router.get('/:id/comments', getPostComments);
