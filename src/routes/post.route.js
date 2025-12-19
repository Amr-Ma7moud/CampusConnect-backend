import express from 'express';
import { verifyRole } from '../middlewares/auth.middleware.js';
import { createPost, editPost } from '../controllers/post.controller.js';

const router = express.Router();


router.post('/', verifyRole['club_manager', 'admin'], createPost);
// router.delete('/:post_id', verifyRole['club_manager', 'admin'], );
router.put('/:post_id', verifyRole['club_manager', 'admin'], editPost);
router.get('/', );
router.get('/:id/comments', );
