import { Request, Response, NextFunction } from 'express';
import { aiService } from '../services/ai/ai.service';
import { prisma } from '../config/db';
import { AuthenticatedRequest } from '../middlewares/auth';
import { NotFoundError } from '../utils/errors';

export class AIController {
  async summarize(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, author, type } = req.body;
      const summary = await aiService.generateSummary(title, author, type);
      return res.status(200).json({ success: true, data: { summary } });
    } catch (err) {
      return next(err);
    }
  }

  async getRecommendations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const userBooks = await prisma.book.findMany({
        where: { userId },
        select: { title: true }
      });
      const history = userBooks.map(b => b.title);
      const recommendations = await aiService.generateRecommendations(history);
      return res.status(200).json({ success: true, data: recommendations });
    } catch (err) {
      return next(err);
    }
  }

  async getInsights(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      
      // Calculate user aggregates
      const aggregatedResult = await prisma.readingSession.aggregate({
        where: { userId },
        _sum: { pagesRead: true, durationSeconds: true },
        _count: { id: true }
      });

      // Fetch streak (we can pull simple streak value or default parameters)
      // For calculation simple fallback:
      const streak = 3; 

      const insights = await aiService.generateInsights({
        totalPagesRead: aggregatedResult._sum.pagesRead || 0,
        totalDurationSeconds: aggregatedResult._sum.durationSeconds || 0,
        totalSessions: aggregatedResult._count.id || 0,
        currentStreak: streak
      });

      return res.status(200).json({ success: true, data: { insights } });
    } catch (err) {
      return next(err);
    }
  }

  async predictGoals(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      
      const aggregatedResult = await prisma.readingSession.aggregate({
        where: { userId },
        _sum: { pagesRead: true }
      });

      const completedCount = await prisma.book.count({
        where: { userId, status: 'completed' }
      });

      // Targets: Mock default values or configurable later
      const prediction = await aiService.predictGoalCompletion(
        {
          totalPagesRead: aggregatedResult._sum.pagesRead || 0,
          completedCount
        },
        {
          yearlyTarget: 12,
          monthlyPagesTarget: 300
        }
      );

      return res.status(200).json({ success: true, data: { prediction } });
    } catch (err) {
      return next(err);
    }
  }

  async getCoachFeedback(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { prompt } = req.body;
      const userId = req.user!.userId;

      const activeBook = await prisma.book.findFirst({
        where: { userId, status: 'currently-reading' },
        select: { title: true }
      });

      const feedback = await aiService.getCoachResponse(prompt, {
        streak: 3,
        recentReadTitle: activeBook?.title || undefined
      });

      return res.status(200).json({ success: true, data: { feedback } });
    } catch (err) {
      return next(err);
    }
  }

  async searchBooks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { query } = req.body;
      const userId = req.user!.userId;

      const booksList = await prisma.book.findMany({
        where: { userId },
        select: { id: true, title: true, author: true, status: true }
      });

      const matchedIds = await aiService.naturalLanguageSearch(booksList, query);
      return res.status(200).json({ success: true, data: matchedIds });
    } catch (err) {
      return next(err);
    }
  }

  async createFlashcards(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { bookId } = req.body;
      const userId = req.user!.userId;

      const book = await prisma.book.findFirst({
        where: { id: bookId, userId },
        include: { notesHighlights: { select: { content: true } } }
      });

      if (!book) throw new NotFoundError('Book not found');

      const notesList = book.notesHighlights.map(n => n.content);
      const cards = await aiService.generateFlashcards(book.title, notesList);

      return res.status(200).json({ success: true, data: cards });
    } catch (err) {
      return next(err);
    }
  }

  async askBookQuestion(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { bookId, question } = req.body;
      const userId = req.user!.userId;

      const book = await prisma.book.findFirst({
        where: { id: bookId, userId },
        select: { title: true }
      });

      if (!book) throw new NotFoundError('Book not found');

      const answer = await aiService.askAboutBook(book.title, question);
      return res.status(200).json({ success: true, data: { answer } });
    } catch (err) {
      return next(err);
    }
  }
}
export const aiController = new AIController();
