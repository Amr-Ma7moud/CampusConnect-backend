import { Router } from 'express';
import { getEventById } from '../controllers/event.controller.js';
const router = Router();

router.get('/event/{event_id}', getEventById);

export default router;