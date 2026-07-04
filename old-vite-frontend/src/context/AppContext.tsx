import React, { createContext, useContext, useState, useEffect } from 'react';

// TypeScript Definitions
export interface Note {
  id: string;
  page: number;
  content: string;
  date: string;
}

export interface Highlight {
  id: string;
  page: number;
  content: string;
  date: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  totalPages: number;
  currentPage: number;
  coverUrl: string;
  status: 'currently-reading' | 'completed' | 'want-to-read' | 'owned';
  rating?: number;
  review?: string;
  startDate?: string;
  endDate?: string;
  collections: string[];
  notes: Note[];
  highlights: Highlight[];
}

export interface ReadingSession {
  id: string;
  bookId: string;
  bookTitle: string;
  date: string; // YYYY-MM-DD
  durationMinutes: number;
  startPage: number;
  endPage: number;
  pagesRead: number;
  notes?: string;
}

export interface Streak {
  currentStreak: number;
  lastReadDate: string | null;
  history: string[]; // Dates read: YYYY-MM-DD
}

export interface Goals {
  yearlyBooksTarget: number;
  monthlyPagesTarget: number;
}

interface AppContextType {
  books: Book[];
  sessions: ReadingSession[];
  streak: Streak;
  goals: Goals;
  collections: string[];
  activeSession: { bookId: string; startTime: number } | null;
  addBook: (book: Omit<Book, 'id' | 'notes' | 'highlights'>) => void;
  updateBook: (id: string, updates: Partial<Book>) => void;
  deleteBook: (id: string) => void;
  logSession: (bookId: string, durationMinutes: number, startPage: number, endPage: number, notes?: string, newHighlights?: string[]) => void;
  startActiveSession: (bookId: string) => void;
  cancelActiveSession: () => void;
  updateGoals: (updates: Partial<Goals>) => void;
  addCollection: (name: string) => void;
  deleteCollection: (name: string) => void;
  addNote: (bookId: string, page: number, content: string) => void;
  addHighlight: (bookId: string, page: number, content: string) => void;
  deleteNote: (bookId: string, noteId: string) => void;
  deleteHighlight: (bookId: string, highlightId: string) => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to format date as YYYY-MM-DD
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Initial Mock Data to wow the user on first load
const getMockBooks = (): Book[] => [
  {
    id: 'book-1',
    title: 'Creative Selection',
    author: 'Ken Kocienda',
    totalPages: 272,
    currentPage: 154,
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=300',
    status: 'currently-reading',
    startDate: '2026-06-15',
    collections: ['Design', 'Technology'],
    notes: [
      { id: 'n-1', page: 42, content: 'Demo sessions at Apple had to be rock solid. You had to prove that the technology worked invisibly.', date: '2026-06-17' },
      { id: 'n-2', page: 112, content: 'Designing the iPhone keyboard required an intersection of algorithms and heuristic analysis of key tap distributions.', date: '2026-06-22' }
    ],
    highlights: [
      { id: 'h-1', page: 23, content: 'Creative selection is a process that relies on small teams of people doing focused work and demonstrating their results iteratively.', date: '2026-06-16' }
    ]
  },
  {
    id: 'book-2',
    title: 'Steve Jobs',
    author: 'Walter Isaacson',
    totalPages: 656,
    currentPage: 656,
    coverUrl: 'https://images.unsplash.com/photo-1531988042231-d39a9cc12a9a?auto=format&fit=crop&q=80&w=300',
    status: 'completed',
    rating: 5,
    review: 'A masterpiece capturing the complex, relentless drive of a visionary who shaped our modern tech landscape. The lessons on typography, focus, and product simplicity are timeless.',
    startDate: '2026-05-01',
    endDate: '2026-06-10',
    collections: ['Biography', 'Business'],
    notes: [],
    highlights: [
      { id: 'h-2', page: 320, content: 'Simplicity is the ultimate sophistication. When you start, everything seems complicated. But if you keep going, you can peel back layers to find the elegant, simple solution.', date: '2026-05-18' }
    ]
  },
  {
    id: 'book-3',
    title: 'The Creative Act: A Way of Being',
    author: 'Rick Rubin',
    totalPages: 432,
    currentPage: 0,
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=300',
    status: 'want-to-read',
    collections: ['Philosophy', 'Design'],
    notes: [],
    highlights: []
  },
  {
    id: 'book-4',
    title: 'Designing Design',
    author: 'Kenya Hara',
    totalPages: 472,
    currentPage: 320,
    coverUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=300',
    status: 'currently-reading',
    startDate: '2026-06-20',
    collections: ['Design'],
    notes: [],
    highlights: [
      { id: 'h-3', page: 85, content: 'White is not a color; it is a sensitivity. To perceive white is to acknowledge empty space and the potential it contains.', date: '2026-06-24' }
    ]
  },
  {
    id: 'book-5',
    title: 'Anatomy of Design',
    author: 'Steven Heller',
    totalPages: 208,
    currentPage: 0,
    coverUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=300',
    status: 'owned',
    collections: ['Design'],
    notes: [],
    highlights: []
  }
];

const getMockSessions = (): ReadingSession[] => {
  const today = new Date();
  const sessions: ReadingSession[] = [];
  
  // Create 6 sessions over the last week to show nice graphs
  const bookIds = ['book-1', 'book-4', 'book-1', 'book-4', 'book-1', 'book-1'];
  const titles = ['Creative Selection', 'Designing Design', 'Creative Selection', 'Designing Design', 'Creative Selection', 'Creative Selection'];
  const increments = [15, 20, 25, 30, 20, 18];
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = formatDate(d);
    
    sessions.push({
      id: `s-mock-${i}`,
      bookId: bookIds[i],
      bookTitle: titles[i],
      date: dateStr,
      durationMinutes: 20 + (i * 5),
      startPage: 40 + (i * 15),
      endPage: 40 + (i * 15) + increments[i],
      pagesRead: increments[i],
      notes: i % 2 === 0 ? `Enjoyed reading today. Captured interesting concepts about user validation.` : undefined
    });
  }
  return sessions;
};

const getMockStreak = (): Streak => {
  const today = new Date();
  const history: string[] = [];
  
  // Fill past 12 days in streak history
  for (let i = 12; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    history.push(formatDate(d));
  }
  
  return {
    currentStreak: 13,
    lastReadDate: formatDate(today),
    history
  };
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from local storage or fallback to mock data
  const [books, setBooks] = useState<Book[]>(() => {
    const saved = localStorage.getItem('bv_books');
    return saved ? JSON.parse(saved) : getMockBooks();
  });

  const [sessions, setSessions] = useState<ReadingSession[]>(() => {
    const saved = localStorage.getItem('bv_sessions');
    return saved ? JSON.parse(saved) : getMockSessions();
  });

  const [streak, setStreak] = useState<Streak>(() => {
    const saved = localStorage.getItem('bv_streak');
    return saved ? JSON.parse(saved) : getMockStreak();
  });

  const [goals, setGoals] = useState<Goals>(() => {
    const saved = localStorage.getItem('bv_goals');
    return saved ? JSON.parse(saved) : { yearlyBooksTarget: 24, monthlyPagesTarget: 800 };
  });

  const [collections, setCollections] = useState<string[]>(() => {
    const saved = localStorage.getItem('bv_collections');
    return saved ? JSON.parse(saved) : ['Design', 'Technology', 'Philosophy', 'Biography', 'Business', 'Productivity'];
  });

  const [activeSession, setActiveSession] = useState<{ bookId: string; startTime: number } | null>(() => {
    const saved = localStorage.getItem('bv_active_session');
    return saved ? JSON.parse(saved) : null;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('bv_books', JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem('bv_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('bv_streak', JSON.stringify(streak));
  }, [streak]);

  useEffect(() => {
    localStorage.setItem('bv_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('bv_collections', JSON.stringify(collections));
  }, [collections]);

  useEffect(() => {
    if (activeSession) {
      localStorage.setItem('bv_active_session', JSON.stringify(activeSession));
    } else {
      localStorage.removeItem('bv_active_session');
    }
  }, [activeSession]);

  // Actions
  const addBook = (bookData: Omit<Book, 'id' | 'notes' | 'highlights'>) => {
    const newBook: Book = {
      ...bookData,
      id: `book-${Date.now()}`,
      notes: [],
      highlights: [],
      currentPage: bookData.status === 'completed' ? bookData.totalPages : bookData.currentPage || 0
    };
    setBooks(prev => [newBook, ...prev]);
  };

  const updateBook = (id: string, updates: Partial<Book>) => {
    setBooks(prev => prev.map(book => {
      if (book.id === id) {
        const merged = { ...book, ...updates };
        // Sync page bounds
        if (merged.currentPage > merged.totalPages) {
          merged.currentPage = merged.totalPages;
        }
        if (merged.status === 'completed') {
          merged.currentPage = merged.totalPages;
          if (!merged.endDate) {
            merged.endDate = formatDate(new Date());
          }
        }
        return merged;
      }
      return book;
    }));
  };

  const deleteBook = (id: string) => {
    setBooks(prev => prev.filter(book => book.id !== id));
    // Clear sessions associated with this book
    setSessions(prev => prev.filter(s => s.bookId !== id));
    if (activeSession?.bookId === id) {
      setActiveSession(null);
    }
  };

  const startActiveSession = (bookId: string) => {
    setActiveSession({
      bookId,
      startTime: Date.now()
    });
  };

  const cancelActiveSession = () => {
    setActiveSession(null);
  };

  const logSession = (
    bookId: string,
    durationMinutes: number,
    startPage: number,
    endPage: number,
    notes?: string,
    newHighlights?: string[]
  ) => {
    const todayStr = formatDate(new Date());
    const book = books.find(b => b.id === bookId);
    if (!book) return;

    const pagesRead = Math.max(0, endPage - startPage);

    // Create session record
    const newSession: ReadingSession = {
      id: `session-${Date.now()}`,
      bookId,
      bookTitle: book.title,
      date: todayStr,
      durationMinutes,
      startPage,
      endPage,
      pagesRead,
      notes: notes || undefined
    };

    setSessions(prev => [newSession, ...prev]);

    // Update book page progression
    const updatedNotes = [...book.notes];
    if (notes) {
      updatedNotes.push({
        id: `n-${Date.now()}`,
        page: endPage,
        content: notes,
        date: todayStr
      });
    }

    const updatedHighlights = [...book.highlights];
    if (newHighlights && newHighlights.length > 0) {
      newHighlights.forEach((text, index) => {
        updatedHighlights.push({
          id: `h-${Date.now()}-${index}`,
          page: endPage,
          content: text,
          date: todayStr
        });
      });
    }

    const isNowCompleted = endPage >= book.totalPages;

    updateBook(bookId, {
      currentPage: endPage,
      status: isNowCompleted ? 'completed' : 'currently-reading',
      endDate: isNowCompleted ? todayStr : book.endDate,
      notes: updatedNotes,
      highlights: updatedHighlights
    });

    // Update Streak
    updateStreak(todayStr);

    // End active session
    setActiveSession(null);
  };

  const updateStreak = (todayStr: string) => {
    setStreak(prev => {
      const history = [...prev.history];
      if (history.includes(todayStr)) {
        return prev; // Already logged reading today
      }

      history.push(todayStr);
      
      // Calculate current streak
      let currentStreak = prev.currentStreak;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = formatDate(yesterday);

      if (prev.lastReadDate === todayStr) {
        // No change
      } else if (prev.lastReadDate === yesterdayStr || prev.lastReadDate === null) {
        currentStreak += 1;
      } else {
        // Streak was broken, check history
        currentStreak = 1; // start new streak
      }

      return {
        currentStreak,
        lastReadDate: todayStr,
        history
      };
    });
  };

  const updateGoals = (updates: Partial<Goals>) => {
    setGoals(prev => ({ ...prev, ...updates }));
  };

  const addCollection = (name: string) => {
    const trimmed = name.trim();
    if (trimmed && !collections.includes(trimmed)) {
      setCollections(prev => [...prev, trimmed]);
    }
  };

  const deleteCollection = (name: string) => {
    setCollections(prev => prev.filter(c => c !== name));
    // Remove references in books
    setBooks(prev => prev.map(b => ({
      ...b,
      collections: b.collections.filter(c => c !== name)
    })));
  };

  const addNote = (bookId: string, page: number, content: string) => {
    const todayStr = formatDate(new Date());
    setBooks(prev => prev.map(book => {
      if (book.id === bookId) {
        return {
          ...book,
          notes: [...book.notes, { id: `n-${Date.now()}`, page, content, date: todayStr }]
        };
      }
      return book;
    }));
  };

  const addHighlight = (bookId: string, page: number, content: string) => {
    const todayStr = formatDate(new Date());
    setBooks(prev => prev.map(book => {
      if (book.id === bookId) {
        return {
          ...book,
          highlights: [...book.highlights, { id: `h-${Date.now()}`, page, content, date: todayStr }]
        };
      }
      return book;
    }));
  };

  const deleteNote = (bookId: string, noteId: string) => {
    setBooks(prev => prev.map(book => {
      if (book.id === bookId) {
        return {
          ...book,
          notes: book.notes.filter(n => n.id !== noteId)
        };
      }
      return book;
    }));
  };

  const deleteHighlight = (bookId: string, highlightId: string) => {
    setBooks(prev => prev.map(book => {
      if (book.id === bookId) {
        return {
          ...book,
          highlights: book.highlights.filter(h => h.id !== highlightId)
        };
      }
      return book;
    }));
  };

  const resetAllData = () => {
    setBooks(getMockBooks());
    setSessions(getMockSessions());
    setStreak(getMockStreak());
    setGoals({ yearlyBooksTarget: 24, monthlyPagesTarget: 800 });
    setCollections(['Design', 'Technology', 'Philosophy', 'Biography', 'Business', 'Productivity']);
    setActiveSession(null);
  };

  return (
    <AppContext.Provider value={{
      books,
      sessions,
      streak,
      goals,
      collections,
      activeSession,
      addBook,
      updateBook,
      deleteBook,
      logSession,
      startActiveSession,
      cancelActiveSession,
      updateGoals,
      addCollection,
      deleteCollection,
      addNote,
      addHighlight,
      deleteNote,
      deleteHighlight,
      resetAllData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
