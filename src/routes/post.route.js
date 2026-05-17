import express from 'express';
import { verifyRole } from '../middlewares/auth.middleware.js';
import { 
     addCommentToPost,
     createPost, 
     editPost, 
     getNewsFeed, 
     getPostComments, 
     likePost, 
     unlikePost,
     deletePost,
     getPostById
     } from '../controllers/post.controller.js';
import {upload} from "../config/cloudPhotoUpload.js";

const router = express.Router();


router.post('/', verifyRole(['club_manager', 'admin']), createPost);
router.delete('/:post_id', verifyRole(['club_manager', 'admin']), deletePost);
router.put('/:post_id', verifyRole(['club_manager', 'admin']), editPost);
router.get('/', getNewsFeed);
router.get('/:id', getPostById);
router.post('/:id/like', likePost);
router.delete('/:id/like', unlikePost);
router.post('/:id/comments', addCommentToPost);
router.get('/:id/comments', getPostComments);

export default router;
