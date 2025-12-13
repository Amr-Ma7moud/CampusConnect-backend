import { Router } from "express";
import { createRoom } from "../controllers/room.controller.js";
import { verifyRole } from "../middlewares/auth.middleware.js";

const adminRouter = Router();

adminRouter.post('/rooms', verifyRole(['admin']), createRoom);

export default adminRouter;