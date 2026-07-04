import { Router } from 'express';
import { SessionController } from '../controllers/session.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validator';
import { sessionCreateSchema } from '../utils/schemas';

const router = Router();
const controller = new SessionController();

router.use(authenticate);

/**
 * @route   GET /api/sessions
 * @desc    Fetch historical user reading session logs
 * @access  Private
 */
router.get('/', controller.getSessions);

/**
 * @route   POST /api/sessions
 * @desc    Log a completed focused reading session (automatically updates book page count)
 * @access  Private
 */
router.post('/', validate(sessionCreateSchema), controller.createSession);

/**
 * @route   GET /api/sessions/analytics
 * @desc    Fetch aggregated reading speeds, page sums, and calendar streak history
 * @access  Private
 */
router.get('/analytics', controller.getAnalytics);

export default router;
