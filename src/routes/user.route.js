import express from 'express';
import { banUser, getAllStudents, getUserProfile, searchForStudent ,unbanUser} from '../controllers/user.controller.js';
import { verifyRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/me', getUserProfile);
router.get('/students', verifyRole(['admin']), getAllStudents);
router.patch('/:id/ban', verifyRole(['admin']), banUser);
router.patch('/:id/unban', verifyRole(['admin']), unbanUser);
router.get('/', verifyRole(['admin']), searchForStudent);

export default router;