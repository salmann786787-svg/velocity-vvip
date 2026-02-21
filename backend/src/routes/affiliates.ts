import { Router } from 'express';
import { getAffiliates, createAffiliate, updateAffiliate, deleteAffiliate } from '../controllers/affiliateController';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', getAffiliates);
router.post('/', createAffiliate);
router.put('/:id', updateAffiliate);
router.delete('/:id', deleteAffiliate);

export default router;
