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
