import { Router } from 'express';
import { getDrivers, createDriver, updateDriver, deleteDriver } from '../controllers/driverController';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', getDrivers);
router.post('/', createDriver);
router.put('/:id', updateDriver);
router.delete('/:id', deleteDriver);

export default router;
