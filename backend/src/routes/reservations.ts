import { Router } from 'express';
import { createReservation, getReservations, updateReservation, deleteReservation } from '../controllers/reservationController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate); // Protect all reservation routes

router.post('/', createReservation);
router.get('/', getReservations);
router.put('/:id', updateReservation);
router.delete('/:id', deleteReservation);

export default router;
