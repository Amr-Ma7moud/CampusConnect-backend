import clubRepository from "../repositories/club.repository.js";
import eventRepository from "../repositories/event.repository.js";
import facilityRepository from "../repositories/facility.repository.js";
import roomRepository from "../repositories/room.repository.js";
import userRepository from "../repositories/user.repository.js";

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

    async getStats() {
        const students = userRepository.getAllStudents();

        const clubs = clubRepository.getAllClubs();
        let activeClubs = 0;
        for(let club of clubs) activeClubs += club.status == "active";

        const events = eventRepository.getAllEvents();
        let activeEvents = 0, activeSessions = 0;
        for(let event of events) 
        {
            activeEvents += event.type == "event";
            activeSessions += event.type == "session";
        }

        const reservedRooms = roomRepository.getAllRoomsReservations();
        const roomsReserved = new Set();         
        for(let room of reservedRooms) {
            roomsReserved.add(room.room_id);
        }

        return {
            total_students: students.length,
            active_clubs: activeClubs,
            active_events: activeEvents,
            active_sessions: activeSessions,
            reserved_rooms: roomsReserved.size,
            reserved_facilities: 0 // we will add this later
        }
    }

    async getAttendanceOverview() {
        const result = await eventRepository.getAttendanceForAllEvents();
        return result;
    }

    async getPendingEvents() {
        const events = await eventRepository.getAllPendingEvents();

        let pendingEvents = [];

        for(myEvent of events) {
            pendingEvents.push({
                event_id: myEvent.event_id,
                club_name: myEvent.name,
                club_logo_url: myEvent.logo,
                type: myEvent.type,
                description: myEvent.description,
                start_time: myEvent.event_start_date,
                end_time: myEvent.event_end_date,
                max_registerations: myEvent.max_capacity
            })
        }

        return pendingEvents;
    }

    async approveEvent(eventId, status, roomId) {
        if(status == "approved") {
            await eventRepository.updateEventStatus(eventId, 'scheduled');
            await eventRepository.assignRoomToEvent(eventId, roomId);
        } else {
            await eventRepository.updateEventStatus(eventId, 'cancelled')
        }
    }
}

export default new AdminService();