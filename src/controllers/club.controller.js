
import ClubService from '../services/club.service.js';
import { saveLog } from '../utils/logs.js';

export const createClub = async (req, res) => {
    const { name, description, email, std_ids } = req.body;

    try {
        if (!name || !description || !email || !std_ids) {
            return res.status(400).json({
                message: 'Missing required fields',
                details: "name, description, email, std_ids are required"
            });
        }

        if (std_ids.length === 0) {
            return res.status(400).json({
                message: 'Missing required fields',
                details: "std_ids cannot be empty"
            });
        }

        if (await ClubService.findClubByEmail(email)) {
            return res.status(409).json({
                message: 'Conflict',
                details: "Club with this email already exists"
            });
        }

        const clubId = await ClubService.createClub({ name, description, email, std_ids });

        await saveLog({
            ip_address: req.ip,
            user_type: 'admin', // or system? Assuming admin creates clubs or authorized user.
            record_id: clubId,
            edited_table: 'clubs',
            action: 'create',
            changed_by: req.user ? req.user.id : 'admin'
        });

        res.status(201);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create club' });
    }
};


export const editClub = async (req, res) => {

    const id = req.params.id;

    if (!await ClubService.findClubById(id)) {
        return res.status(404).json({
            message: 'Club not found',
            details: `No club found with id ${id}`
        });
    }

    const userId = req.user.id;

    if (!await ClubService.checkUserIsClubManager(id, userId)) {
        return res.status(403).json({
            message: 'Forbidden: You are not a club manager',
            details: "Only club managers can edit club details"
        });
    }

    const { name, description, logo, cover } = req.body;

    try {
        await ClubService.editClub(id, { name, description, logo, cover });

        await saveLog({
            ip_address: req.ip,
            user_type: 'club_manager',
            record_id: id,
            edited_table: 'clubs',
            action: 'update',
            changed_by: userId
        });

        res.status(200).json({ message: 'Club updated successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update club' });
    }
};

export const followClub = async (req, res) => {
    const id = req.params.id;
    const userId = req.user.id;

    if (!await ClubService.findClubById(id)) {
        return res.status(404).json({
            message: 'Club not found',
            details: `No club found with id ${id}`
        });
    }

    if (await ClubService.isUserFollowingClub(id, userId)) {
        return res.status(409).json({
            message: 'Conflict: Already following',
            details: 'You are already following this club'
        });
    }

    try {
        await ClubService.followClub(id, userId);

        await saveLog({
            ip_address: req.ip,
            user_type: 'student',
            record_id: id,
            edited_table: 'std_follow_club',
            action: 'follow',
            changed_by: userId
        });

        res.status(200).json({ message: 'Successfully followed the club' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to follow club' });
    }
}

export const unfollowClub = async (req, res) => {
    const id = req.params.id;
    const userId = req.user.id;

    if (!await ClubService.findClubById(id)) {
        return res.status(404).json({
            message: 'Club not found',
            details: `No club found with id ${id}`
        });
    }

    if (!await ClubService.isUserFollowingClub(id, userId)) {
        return res.status(409).json({
            message: 'Conflict: Not following',
            details: 'You are not following this club'
        });
    }

    try {
        await ClubService.unfollowClub(id, userId);

        await saveLog({
            ip_address: req.ip,
            user_type: 'student',
            record_id: id,
            edited_table: 'std_follow_club',
            action: 'unfollow',
            changed_by: userId
        });

        res.status(200).json({ message: 'Successfully unfollowed the club' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to unfollow club' });
    }
};

export const getClubDetails = async (req, res) => {
    const id = req.params.id;
    const userId = req.user.id;

    const club = await ClubService.findClubById(id);
    if (!club) {
        return res.status(404).json({
            message: 'Club not found',
            details: `No club found with id ${id}`
        });
    }

    try {
        const clubDetails = await ClubService.getClubDetails(id, userId);
        res.status(200).json(clubDetails);
    } catch (err) {
        res.status(500).json({ error: 'Failed to get club details' });
    }
};

export const listClubs = async (req, res) => {
    try {
        const userId = req.user.id;
        const clubs = await ClubService.listAllClubs(userId);
        res.status(200).json(clubs);
    } catch (err) {
        res.status(500).json({ error: 'Failed to list clubs' });
    }
}

export const reportClubIssue = async (req, res) => {
    const { club_id, reason, details } = req.body;
    const userId = req.user.id;

    try {
        if (!club_id || !reason || !details) {
            return res.status(400).json({
                message: 'Missing required fields',
                details: 'club_id, reason, and details are required.'
            });
        }

        await ClubService.reportClubIssue(userId, club_id, reason, details);

        await saveLog({
            ip_address: req.ip,
            user_type: 'student',
            record_id: club_id,
            edited_table: 'std_report_club',
            action: 'report_issue',
            changed_by: userId
        });

        return res.status(200).json({ message: 'Club issue reported successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error reporting club issue: ' + err.message });
    }
};