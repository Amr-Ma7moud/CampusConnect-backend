import { Router } from "express";
import { createRoom } from "../controllers/room.controller.js";
import { createFacility } from "../controllers/facility.controller.js";
import { verifyRole } from "../middlewares/auth.middleware.js";

const adminRouter = Router();

adminRouter.post('/rooms', verifyRole(['admin']), createRoom);
adminRouter.post('/facilities', verifyRole(['admin']), createFacility );
export default adminRouter;