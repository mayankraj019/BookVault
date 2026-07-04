import { prisma } from '../config/db';
import { Book, Prisma, NoteHighlight } from '@prisma/client';

export class BookRepository {
  async findById(id: string, userId: string): Promise<(Book & { 
    collections: { collectionId: string }[];
    notesHighlights: NoteHighlight[];
  }) | null> {
    return prisma.book.findFirst({
      where: { id, userId },
      include: {
        collections: { select: { collectionId: true } },
        notesHighlights: true
      }
    }) as any;
  }

  async findAll(userId: string, filters?: { status?: string; search?: string }): Promise<Book[]> {
    const whereClause: Prisma.BookWhereInput = { userId };

    if (filters?.status && filters.status !== 'all') {
      whereClause.status = filters.status;
    }

    if (filters?.search) {
      whereClause.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { author: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    return prisma.book.findMany({
      where: whereClause,
      orderBy: { updatedAt: 'desc' }
    });
  }

  async create(data: Omit<Prisma.BookUncheckedCreateInput, 'collections'> & { collectionIds?: string[] }): Promise<Book> {
    const { collectionIds, ...bookData } = data;
    return prisma.book.create({
      data: {
        ...bookData,
        collections: collectionIds ? {
          create: collectionIds.map(id => ({ collectionId: id }))
        } : undefined
      }
    });
  }

  async update(
    id: string, 
    userId: string, 
    data: Prisma.BookUpdateInput & { collectionIds?: string[] }
  ): Promise<Book> {
    const { collectionIds, ...bookData } = data;

    // If collections update is specified, delete old references and insert new ones
    if (collectionIds !== undefined) {
      await prisma.bookCollection.deleteMany({ where: { bookId: id } });
      
      return prisma.book.update({
        where: { id, userId },
        data: {
          ...bookData,
          collections: {
            create: collectionIds.map(colId => ({ collectionId: colId }))
          }
        }
      });
    }

    return prisma.book.update({
      where: { id, userId },
      data: bookData
    });
  }

  async delete(id: string, userId: string): Promise<Book> {
    return prisma.book.delete({ where: { id, userId } });
  }

  // Notes & Highlights
  async createNoteHighlight(data: Prisma.NoteHighlightUncheckedCreateInput): Promise<NoteHighlight> {
    return prisma.noteHighlight.create({ data });
  }

  async deleteNoteHighlight(id: string, bookId: string, userId: string): Promise<NoteHighlight> {
    return prisma.noteHighlight.delete({
      where: { 
        id, 
        book: { id: bookId, userId }
      }
    });
  }
}
