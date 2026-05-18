import reservationRepository from "../repositories/reservation.repository.js";
import reservationRepo from "../repositories/reservation.repository.js";

class ReservationService {
    async getActiveReservationsByUserId(userId) {
        const roomReservations = await reservationRepo.getActiveRoomReservations(userId);
        const facilityReservations = await reservationRepo.getActiveFacilityReservations(userId);
        const eventRegistrations = await reservationRepo.getActiveEventRegistrations(userId);

        const allReservations = [];

        // Add room reservations
        for (let reservation of roomReservations) {
            allReservations.push({
                reservation_id: `room_${reservation.room_id}_${reservation.start_time}`,
                title: reservation.room_name || `Room ${reservation.room_id}`,
                start_time: reservation.start_time,
                end_time: reservation.end_time,
                type: 'Room'
            });
        }

        // Add facility reservations
        for (let reservation of facilityReservations) {
            allReservations.push({
                reservation_id: `facility_${reservation.facility_id}_${reservation.reservation_start_date}`,
                title: reservation.facility_name || `Facility ${reservation.facility_id}`,
                start_time: reservation.reservation_start_date,
                end_time: reservation.reservation_end_date,
                type: reservation.type === 'gym' ? 'Sports' : reservation.type.charAt(0).toUpperCase() + reservation.type.slice(1)
            });
        }

        // Add event registrations
        for (let registration of eventRegistrations) {
            allReservations.push({
                reservation_id: `event_${registration.event_id}`,
                title: registration.title,
                start_time: registration.event_start_date,
                end_time: registration.event_end_date,
                type: registration.type === 'session' ? 'Session' : 'Event'
            });
        }

        // Sort by start_time
        allReservations.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

        return allReservations;
    }

    async deleteActiveReservationByUserId(userId, facilityId, reservationStartDate) {
        await reservationRepository.deleteActiveReservationByUserId(userId, facilityId, reservationStartDate);
    }

}

export default new ReservationService();
