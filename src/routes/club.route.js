import express from 'express';
import { verifyRole } from '../middlewares/auth.middleware.js';
import { createClub, editClub } from '../controllers/club.controller.js';

const router = express.Router();


router.post('/', verifyRole(['admin']), createClub);
router.get('/', );
router.get('/:id', );
router.put('/:id', editClub);
router.post('/:id/follow', );
router.delete('/:id/follow', );

export default router;