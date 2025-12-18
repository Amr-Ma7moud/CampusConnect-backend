import express from 'express';
import { reserveRoom } from '../controllers/room.controller.js';

const router = express.Router();


router.post('/reserve', reserveRoom);