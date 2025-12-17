import express from 'express';
import { getStudentProfile } from '../controllers/user.controller.js';

const userRouter = express.Router();

userRouter.get('/me', getStudentProfile);

export default userRouter;