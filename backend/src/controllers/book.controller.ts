import { Response, NextFunction } from 'express';
import { BookService } from '../services/book.service';
import { AuthenticatedRequest } from '../middlewares/auth';
import { BadRequestError } from '../utils/errors';

const bookService = new BookService();

export class BookController {
  async getBooks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const status = req.query.status as string;
      const search = req.query.search as string;

      const result = await bookService.getBooks(userId, { status, search });
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      return next(err);
    }
  }

  async getBook(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const result = await bookService.getBook(id, userId);
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      return next(err);
    }
  }

  async createBook(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await bookService.createBook(userId, req.body);
      return res.status(201).json({
        success: true,
        data: result
      });
    } catch (err) {
      return next(err);
    }
  }

  async updateBook(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const result = await bookService.updateBook(id, userId, req.body);
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      return next(err);
    }
  }

  async deleteBook(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      await bookService.deleteBook(id, userId);
      return res.status(200).json({
        success: true,
        message: 'Book deleted successfully'
      });
    } catch (err) {
      return next(err);
    }
  }

  // Notes & Highlights
  async createNoteHighlight(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { bookId } = req.params;
      const result = await bookService.addNoteHighlight(bookId, userId, req.body);
      return res.status(201).json({
        success: true,
        data: result
      });
    } catch (err) {
      return next(err);
    }
  }

  async deleteNoteHighlight(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { bookId, id } = req.params;
      await bookService.removeNoteHighlight(id, bookId, userId);
      return res.status(200).json({
        success: true,
        message: 'Note/Highlight removed successfully'
      });
    } catch (err) {
      return next(err);
    }
  }
}
