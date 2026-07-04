import { prisma } from '../config/db';
import { ReadingSession, Prisma } from '@prisma/client';

export class SessionRepository {
  async findAll(userId: string): Promise<(ReadingSession & { book: { title: string; author: string } })[]> {
    return prisma.readingSession.findMany({
      where: { userId },
      include: {
        book: {
          select: { title: true, author: true }
        }
      },
      orderBy: { timestamp: 'desc' }
    });
  }

  async findByBookId(bookId: string, userId: string): Promise<ReadingSession[]> {
    return prisma.readingSession.findMany({
      where: { bookId, userId },
      orderBy: { timestamp: 'desc' }
    });
  }

  async create(data: Prisma.ReadingSessionUncheckedCreateInput): Promise<ReadingSession> {
    return prisma.readingSession.create({ data });
  }

  async getAggregatedStats(userId: string) {
    const totalPagesResult = await prisma.readingSession.aggregate({
      where: { userId },
      _sum: {
        pagesRead: true,
        durationSeconds: true
      },
      _count: {
        id: true
      }
    });

    return {
      totalPagesRead: totalPagesResult._sum.pagesRead || 0,
      totalDurationSeconds: totalPagesResult._sum.durationSeconds || 0,
      totalSessions: totalPagesResult._count.id || 0
    };
  }
}
