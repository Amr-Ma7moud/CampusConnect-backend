import reservationService from "../services/reservation.service.js";
import { saveLog } from "../utils/logs.js";

export const getMyActiveReservations = async (req, res) => {
    const userId = req.user.id;

    try {
        const reservations = await reservationService.getActiveReservationsByUserId(userId);
        return res.status(200).json(reservations);
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};

export const cancelMyReservation = async (req, res) => {
    const userId = req.user.id;
    const { faciltyId, reservationStartDate } = req.body;
    try {
        await reservationService.deleteActiveReservationByUserId(userId, faciltyId, reservationStartDate);
        return res.status(200).json({
            success: true,
            message: "Facility reservation was deleted successfully",
            body: {
                userId,
                faciltyId,
                reservationStartDate
            }
        });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', details: error.message });
    }
}
