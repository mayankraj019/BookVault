export interface Book {
  id: string;
  title: string;
  author: string;
  totalPages: number;
  currentPage: number;
  coverUrl?: string;
  status: 'currently-reading' | 'completed' | 'want-to-read' | 'owned';
  rating: number;
  review?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Collection {
  id: string;
  name: string;
  _count?: {
    books: number;
  };
}

export interface ReadingSession {
  id: string;
  bookId: string;
  durationSeconds: number;
  pagesRead: number;
  timestamp: string;
  book?: {
    title: string;
    author: string;
  };
}

export interface NoteHighlight {
  id: string;
  bookId: string;
  type: 'note' | 'highlight';
  content: string;
  pageNumber?: number;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  role: string;
}
