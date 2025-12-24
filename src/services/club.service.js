import ClubRepo from "../repositories/club.repository.js";
import eventService from "./event.service.js";

class ClubService {
    async createClub({ name, description, email, std_ids }) {
        const clubId = await ClubRepo.createClub({ name, description, email });
        const members = std_ids.map(member => {
            if (typeof member === 'object' && member.id) return member;
            return { id: member, role_title: 'Club Manager' };
        });

        await ClubRepo.addMembersToClub(clubId, members);
        return clubId;
    }

    async findClubByEmail(email) {
        return await ClubRepo.findClubByEmail(email);
    }

    async findClubById(clubId) {
        return await ClubRepo.findClubById(clubId);
    }

    async findClubMembers(clubId) {
        return await ClubRepo.findClubMembers(clubId);
    }

    async checkUserIsClubManager(clubId, userId) {
        const members = await this.findClubMembers(clubId);
        return members.some((member) => member.student_id === userId);
    }

    async editClub(clubId, { name, description, logo, cover }) {
        await ClubRepo.updateClubDetails(clubId, {
            name,
            description,
            logo,
            cover,
        });
    }

    async followClub(clubId, userId) {
        await ClubRepo.addFollower(clubId, userId);
    }

    async unfollowClub(clubId, userId) {
        await ClubRepo.deleteFollower(clubId, userId);
    }

    async isUserFollowingClub(clubId, userId) {
        const followers = await ClubRepo.getClubFollowers(clubId);
        return followers.some((follower) => follower.student_id === userId);
    }

    async getClubDetails(clubId, userId) {
        const club = await this.findClubById(clubId);
        const followers = await ClubRepo.getClubFollowers(clubId);
        const members = await this.findClubMembers(clubId);
        const isJoined = await this.isUserFollowingClub(clubId, userId);
        const events = await eventService.getAllClubEvents(userId);

        return {
            id: club.club_id,
            name: club.name,
            description: club.description,
            email: club.email,
            logo: club.logo,
            cover: club.cover,
            followers_count: followers.length,
            event_number: events.length,
            is_joined: isJoined,
            club_admin_name: members[0].first_name + " " + members[0].last_name,
        };
    }

    async listAllClubs(userId) {
        const clubs = await ClubRepo.getAllClubsWithDetails(userId);

        return clubs.map(club => ({
            id: club.club_id,
            name: club.name,
            description: club.description,
            email: club.email,
            logo: club.logo,
            cover: club.cover,
            followers_count: Number(club.followers_count),
            members: Number(club.followers_count),
            event_number: Number(club.real_event_number), // Only type='event'
            sessions_number: Number(club.session_number), // Only type='session'
            posts_number: Number(club.post_number),
            club_admin_name: club.club_admin_name || 'N/A',
            status: club.status,
            is_joined: Boolean(club.is_joined)
        }));
    }

    async getClubIdByManagerId(managerId) {
        return await ClubRepo.getClubIdByManagerId(managerId);
    }

    async reportClubIssue(student_id, club_id, reason, details) {
        try {
            const reportData = [student_id, club_id, reason, details];
            const result = await ClubRepo.reportClubIssue(reportData);
            return result;
        } catch (error) {
            throw new Error('Error in ClubService: ' + error.message);
        }
    }
}

export default new ClubService();
