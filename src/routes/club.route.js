import express from 'express';
import { verifyRole } from '../middlewares/auth.middleware.js';
import { 
    createClub,
    editClub,
    followClub, 
    getClubDetails, 
    listClubs, 
    reportClubIssue, 
    unfollowClub } from '../controllers/club.controller.js';

const router = express.Router();


router.post('/', verifyRole(['admin']), createClub);
router.get('/', listClubs);
router.get('/:id', getClubDetails);
router.put('/:id', verifyRole['club_manager', 'admin'], editClub);
router.post('/:id/follow', followClub);
router.delete('/:id/follow', unfollowClub);
router.post('/report', reportClubIssue);

export default router;