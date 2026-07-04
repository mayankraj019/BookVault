import { Router } from 'express';
import { BookController } from '../controllers/book.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validator';
import { bookCreateSchema, bookUpdateSchema } from '../utils/schemas';

const router = Router();
const controller = new BookController();

router.use(authenticate);

/**
 * @route   GET /api/books
 * @desc    Get user books catalog (with search and status filters)
 * @access  Private
 */
router.get('/', controller.getBooks);

/**
 * @route   GET /api/books/:id
 * @desc    Get book profile details, custom shelves, and notesHighlights logs
 * @access  Private
 */
router.get('/:id', controller.getBook);

/**
 * @route   POST /api/books
 * @desc    Create a new book record
 * @access  Private
 */
router.post('/', validate(bookCreateSchema), controller.createBook);

/**
 * @route   PUT /api/books/:id
 * @desc    Update pages, ratings, shelves mapping, and review details
 * @access  Private
 */
router.put('/:id', validate(bookUpdateSchema), controller.updateBook);

/**
 * @route   DELETE /api/books/:id
 * @desc    Delete a book
 * @access  Private
 */
router.delete('/:id', controller.deleteBook);

/**
 * @route   POST /api/books/:bookId/notes
 * @desc    Log a new highlight or review note
 * @access  Private
 */
router.post('/:bookId/notes', controller.createNoteHighlight);

/**
 * @route   DELETE /api/books/:bookId/notes/:id
 * @desc    Remove a note or highlight entry
 * @access  Private
 */
router.delete('/:bookId/notes/:id', controller.deleteNoteHighlight);

export default router;
