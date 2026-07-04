import { BookRepository } from '../repositories/book.repository';
import { NotFoundError } from '../utils/errors';
import { Book, NoteHighlight } from '@prisma/client';

const bookRepository = new BookRepository();

export class BookService {
  async getBooks(userId: string, filters?: { status?: string; search?: string }): Promise<Book[]> {
    return bookRepository.findAll(userId, filters);
  }

  async getBook(id: string, userId: string): Promise<Book & { 
    collections: { collectionId: string }[];
    notesHighlights: NoteHighlight[];
  }> {
    const book = await bookRepository.findById(id, userId);
    if (!book) {
      throw new NotFoundError('Book not found');
    }
    return book;
  }

  async createBook(userId: string, data: {
    title: string;
    author: string;
    totalPages: number;
    currentPage?: number;
    coverUrl?: string;
    status?: string;
    collectionIds?: string[];
  }): Promise<Book> {
    return bookRepository.create({
      userId,
      title: data.title,
      author: data.author,
      totalPages: data.totalPages,
      currentPage: data.currentPage || 0,
      coverUrl: data.coverUrl,
      status: data.status || 'owned',
      collectionIds: data.collectionIds
    });
  }

  async updateBook(id: string, userId: string, data: {
    title?: string;
    author?: string;
    totalPages?: number;
    currentPage?: number;
    coverUrl?: string;
    status?: string;
    rating?: number;
    review?: string;
    collectionIds?: string[];
  }): Promise<Book> {
    const book = await bookRepository.findById(id, userId);
    if (!book) {
      throw new NotFoundError('Book not found');
    }

    // Business rule: Current page cannot exceed total pages
    const finalCurrentPage = data.currentPage !== undefined ? data.currentPage : book.currentPage;
    const finalTotalPages = data.totalPages !== undefined ? data.totalPages : book.totalPages;

    if (finalCurrentPage > finalTotalPages) {
      throw new Error('Current page cannot exceed total pages');
    }

    return bookRepository.update(id, userId, {
      ...data,
      currentPage: finalCurrentPage,
      totalPages: finalTotalPages
    });
  }

  async deleteBook(id: string, userId: string): Promise<Book> {
    const book = await bookRepository.findById(id, userId);
    if (!book) {
      throw new NotFoundError('Book not found');
    }
    return bookRepository.delete(id, userId);
  }

  // Notes & Highlights
  async addNoteHighlight(bookId: string, userId: string, data: {
    type: 'note' | 'highlight';
    content: string;
    pageNumber?: number;
  }): Promise<NoteHighlight> {
    const book = await bookRepository.findById(bookId, userId);
    if (!book) {
      throw new NotFoundError('Book not found');
    }
    return bookRepository.createNoteHighlight({
      bookId,
      userId,
      type: data.type,
      content: data.content,
      pageNumber: data.pageNumber
    });
  }

  async removeNoteHighlight(id: string, bookId: string, userId: string): Promise<NoteHighlight> {
    return bookRepository.deleteNoteHighlight(id, bookId, userId);
  }
}
