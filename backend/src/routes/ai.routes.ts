import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

/**
 * @route   POST /api/ai/summarize
 * @desc    Generate book summary
 * @access  Private
 */
router.post('/summarize', aiController.summarize);

/**
 * @route   GET  /api/ai/recommendations
 * @route   POST /api/ai/recommendations
 * @desc    Get personalized book recommendations
 * @access  Private
 */
router.get('/recommendations', aiController.getRecommendations);
router.post('/recommendations', aiController.getRecommendations);

/**
 * @route   GET  /api/ai/insights
 * @route   POST /api/ai/insights
 * @desc    Get AI reading habit insights
 * @access  Private
 */
router.get('/insights', aiController.getInsights);
router.post('/insights', aiController.getInsights);

/**
 * @route   GET  /api/ai/predict-goals
 * @route   POST /api/ai/predict-goals
 * @desc    Predict goal completion based on reading pace
 * @access  Private
 */
router.get('/predict-goals', aiController.predictGoals);
router.post('/predict-goals', aiController.predictGoals);

/**
 * @route   POST /api/ai/coach
 * @desc    Get motivational reading coach response
 * @access  Private
 */
router.post('/coach', aiController.getCoachFeedback);

/**
 * @route   POST /api/ai/search
 * @desc    Natural language search over user's library
 * @access  Private
 */
router.post('/search', aiController.searchBooks);

/**
 * @route   POST /api/ai/flashcards
 * @desc    Generate flashcards from book notes
 * @access  Private
 */
router.post('/flashcards', aiController.createFlashcards);

/**
 * @route   POST /api/ai/ask
 * @desc    Ask AI a question about a specific book
 * @access  Private
 */
router.post('/ask', aiController.askBookQuestion);

export default router;
