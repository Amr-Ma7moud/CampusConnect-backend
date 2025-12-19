import { Router } from "express";
import { createRoom } from "../controllers/room.controller.js";
import { createFacility } from "../controllers/facility.controller.js";
import { verifyRole } from "../middlewares/auth.middleware.js";
import { createUser } from "../controllers/user.controller.js";

const adminRouter = Router();

adminRouter.post('/rooms', verifyRole(['admin']), createRoom);
adminRouter.post('/facilities', verifyRole(['admin']), createFacility );
adminRouter.post('/users', verifyRole(['admin']), createUser);
export default adminRouter;