import express from 'express';
import { banUser, getStudentProfile } from '../controllers/user.controller.js';
import { verifyRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/me', getStudentProfile);
router.patch('/:id/ban', verifyRole(['admin']), banUser);
router.get('/', verifyRole['admin'], );

export default router;