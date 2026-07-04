import { SessionRepository } from '../repositories/session.repository';
import { BookRepository } from '../repositories/book.repository';
import { NotFoundError } from '../utils/errors';
import { ReadingSession } from '@prisma/client';

const sessionRepository = new SessionRepository();
const bookRepository = new BookRepository();

export class SessionService {
  async getSessions(userId: string): Promise<ReadingSession[]> {
    return sessionRepository.findAll(userId);
  }

  async createSession(userId: string, data: {
    bookId: string;
    durationSeconds: number;
    pagesRead: number;
  }): Promise<ReadingSession> {
    const book = await bookRepository.findById(data.bookId, userId);
    if (!book) {
      throw new NotFoundError('Book not found');
    }

    // Business rule: Log reading session and update book currentPage
    const updatedPage = Math.min(book.totalPages, book.currentPage + data.pagesRead);
    const newStatus = updatedPage === book.totalPages ? 'completed' : 'currently-reading';

    await bookRepository.update(data.bookId, userId, {
      currentPage: updatedPage,
      status: newStatus
    });

    return sessionRepository.create({
      userId,
      bookId: data.bookId,
      durationSeconds: data.durationSeconds,
      pagesRead: data.pagesRead
    });
  }

  async getStreak(userId: string) {
    const sessions = await sessionRepository.findAll(userId);
    if (sessions.length === 0) {
      return { currentStreak: 0, history: [] };
    }

    // Sort session dates descending (ignoring times)
    const dates = sessions.map(s => {
      const dateStr = s.timestamp.toISOString().split('T')[0];
      return new Date(dateStr).getTime();
    });

    const uniqueSortedDates = Array.from(new Set(dates)).sort((a, b) => b - a);

    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();

    const yesterdayTime = todayTime - 24 * 60 * 60 * 1000;

    // Check if user has read today or yesterday to continue streak calculation
    const hasReadRecently = uniqueSortedDates[0] === todayTime || uniqueSortedDates[0] === yesterdayTime;
    
    if (hasReadRecently) {
      currentStreak = 1;
      for (let i = 0; i < uniqueSortedDates.length - 1; i++) {
        const diff = uniqueSortedDates[i] - uniqueSortedDates[i + 1];
        const oneDay = 24 * 60 * 60 * 1000;
        
        if (diff === oneDay) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    return {
      currentStreak,
      history: uniqueSortedDates.map(time => new Date(time).toISOString().split('T')[0])
    };
  }

  async getDashboardAnalytics(userId: string) {
    const stats = await sessionRepository.getAggregatedStats(userId);
    const streak = await this.getStreak(userId);

    return {
      ...stats,
      ...streak
    };
  }
}
