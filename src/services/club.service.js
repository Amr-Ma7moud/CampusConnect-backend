import ClubRepo from '../repositories/club.repository.js'


class ClubService {
    async createClub({ name, description, email, std_ids }) {
        const clubId = await ClubRepo.createClub({ name, description, email });
        await ClubRepo.addMembersToClub(clubId, std_ids);
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
        return members.some(member => member.student_id === userId);
    }

    async editClub(clubId, { name, description, logo, cover }) {
        await ClubRepo.updateClubDetails(clubId, { name, description, logo, cover });
    }

}

export default new ClubService();