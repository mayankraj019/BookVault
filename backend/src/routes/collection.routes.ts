import { Router } from 'express';
import { CollectionController } from '../controllers/collection.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validator';
import { collectionCreateSchema } from '../utils/schemas';

const router = Router();
const controller = new CollectionController();

router.use(authenticate);

/**
 * @route   GET /api/collections
 * @desc    Fetch list of custom bookshelves with count statistics
 * @access  Private
 */
router.get('/', controller.getCollections);

/**
 * @route   POST /api/collections
 * @desc    Create a new bookshelf shelf category
 * @access  Private
 */
router.post('/', validate(collectionCreateSchema), controller.createCollection);

/**
 * @route   DELETE /api/collections/:id
 * @desc    Remove a collection category (retains catalog books)
 * @access  Private
 */
router.delete('/:id', controller.deleteCollection);

export default router;
