import clubRepository from "../repositories/club.repository.js";
import eventRepository from "../repositories/event.repository.js";
import facilityRepository from "../repositories/facility.repository.js";
import roomRepository from "../repositories/room.repository.js";

class AdminService {
    async getAllReports() {
        const clubReports = await clubRepository.getAllReports();
        const eventReports = await eventRepository.getAllReports();
        const roomReports = await roomRepository.getAllReports();
        const facilityReports = await facilityRepository.getAllReports();

        let reports = [];

        for(let report of clubReports) {
            reports.push({
                student_id: report.student_id,
                report_id: report.club_id,
                report_type: 'club',
                status: report.status,
                details: report.details,
                reason: report.reason
            });
        }

        for(let report of eventReports) {
            reports.push({
                student_id: report.student_id,
                report_id: report.club_id,
                report_type: 'event',
                status: report.status,
                details: report.details,
                reason: report.reason
            });
        }

        for(let report of roomReports) {
            reports.push({
                student_id: report.student_id,
                report_id: report.club_id,
                report_type: 'room',
                status: report.status,
                details: report.details,
                reason: report.reason
            });
        }

        for(let report of facilityReports) {
            reports.push({
                student_id: report.student_id,
                report_id: report.club_id,
                report_type: 'facility',
                status: report.status,
                details: report.details,
                reason: report.reason
            });
        }

        return reports;
    }
}

export default new AdminService();