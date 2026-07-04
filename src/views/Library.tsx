'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../utils/api';
import { Book, Collection, NoteHighlight } from '../types';
import { BookCard } from '../components/BookCard';
import { Modal } from '../components/Modal';
import { 
  Search, 
  Plus, 
  Trash2, 
  FolderPlus,
  Sparkles
} from 'lucide-react';

interface LibraryProps {
  onStartSession: (bookId: string) => void;
}

interface CreateBookData {
  title: string;
  author: string;
  totalPages: number;
  status: string;
  coverUrl?: string;
  collectionIds?: string[];
}

export const Library: React.FC<LibraryProps> = ({ onStartSession }) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAiSearch, setIsAiSearch] = useState<boolean>(false);
  const [aiMatchedIds, setAiMatchedIds] = useState<string[] | null>(null);
  
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showAddBookModal, setShowAddBookModal] = useState<boolean>(false);
  const [showAddCollectionModal, setShowAddCollectionModal] = useState<boolean>(false);

  // Form states for new book
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [newBookPages, setNewBookPages] = useState(100);
  const [newBookStatus, setNewBookStatus] = useState<'currently-reading' | 'completed' | 'want-to-read' | 'owned'>('owned');
  const [newBookCover, setNewBookCover] = useState('');
  const [newBookCollections, setNewBookCollections] = useState<string[]>([]);

  // Form states for new collection
  const [newColName, setNewColName] = useState('');

  // Form states for adding notes/highlights
  const [noteType, setNoteType] = useState<'note' | 'highlight'>('note');
  const [noteContent, setNoteContent] = useState('');
  const [notePage, setNotePage] = useState<number | undefined>(undefined);

  // Queries
  const { data: books = [] } = useQuery<Book[]>({
    queryKey: ['books'],
    queryFn: () => apiRequest('/books'),
  });

  const { data: collections = [] } = useQuery<Collection[]>({
    queryKey: ['collections'],
    queryFn: () => apiRequest('/collections'),
  });

  // Query single book details (when selected)
  const { data: bookDetails } = useQuery<Book & { 
    collections: { collectionId: string }[];
    notesHighlights: NoteHighlight[];
  }>({
    queryKey: ['book-details', selectedBook?.id],
    queryFn: () => apiRequest(`/books/${selectedBook!.id}`),
    enabled: !!selectedBook?.id
  });

  // Mutations
  const createBookMutation = useMutation({
    mutationFn: (data: CreateBookData) => apiRequest<Book>('/books', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      setShowAddBookModal(false);
      resetBookForm();
    }
  });

  const deleteBookMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/books/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      setSelectedBook(null);
    }
  });

  const createCollectionMutation = useMutation({
    mutationFn: (name: string) => apiRequest('/collections', { method: 'POST', body: JSON.stringify({ name }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      setShowAddCollectionModal(false);
      setNewColName('');
    }
  });

  const deleteCollectionMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/collections/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      setSelectedCollection(null);
    }
  });

  const addNoteMutation = useMutation({
    mutationFn: (data: { bookId: string; type: string; content: string; pageNumber?: number }) => 
      apiRequest(`/books/${data.bookId}/notes`, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book-details', selectedBook?.id] });
      setNoteContent('');
      setNotePage(undefined);
    }
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (data: { bookId: string; noteId: string }) => 
      apiRequest(`/books/${data.bookId}/notes/${data.noteId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book-details', selectedBook?.id] });
    }
  });

  const updateBookStatusMutation = useMutation({
    mutationFn: (data: { id: string; status: string }) => 
      apiRequest(`/books/${data.id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      if (selectedBook) {
        queryClient.invalidateQueries({ queryKey: ['book-details', selectedBook.id] });
      }
    }
  });

  const resetBookForm = () => {
    setNewBookTitle('');
    setNewBookAuthor('');
    setNewBookPages(100);
    setNewBookStatus('owned');
    setNewBookCover('');
    setNewBookCollections([]);
  };

  const searchBooksMutation = useMutation({
    mutationFn: (query: string) => 
      apiRequest<string[]>('/ai/search', { method: 'POST', body: JSON.stringify({ query }) }),
    onSuccess: (data) => {
      setAiMatchedIds(data);
    }
  });

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (isAiSearch && searchQuery.trim()) {
        searchBooksMutation.mutate(searchQuery.trim());
      } else {
        setAiMatchedIds(null);
      }
    }
  };

  // Filter book list
  const filteredBooks = books.filter((b) => {
    const matchesSearch = isAiSearch && aiMatchedIds !== null
      ? aiMatchedIds.includes(b.id)
      : b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        b.author.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeTab === 'all' || b.status === activeTab;
    
    // Check if book matches selected custom collection tag
    const matchesCollection = !selectedCollection || 
      (bookDetails?.id === b.id 
        ? bookDetails.collections.some(c => c.collectionId === selectedCollection)
        : true); // Simple fallback during list map

    return matchesSearch && matchesTab && matchesCollection;
  });

  const handleCreateBook = (e: React.FormEvent) => {
    e.preventDefault();
    createBookMutation.mutate({
      title: newBookTitle,
      author: newBookAuthor,
      totalPages: Number(newBookPages),
      status: newBookStatus,
      coverUrl: newBookCover || undefined,
      collectionIds: newBookCollections
    });
  };

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    createCollectionMutation.mutate(newColName);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim() || !selectedBook) return;
    addNoteMutation.mutate({
      bookId: selectedBook.id,
      type: noteType,
      content: noteContent,
      pageNumber: notePage ? Number(notePage) : undefined
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto py-4 px-2 md:px-6">
      {/* Header section with Add Books trigger */}
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">Bookshelf</h2>
          <p className="text-xs text-text-secondary mt-0.5">Manage your personal collection of books</p>
        </div>
        <button 
          onClick={() => setShowAddBookModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md bg-brand-primary text-text-inverse hover:bg-brand-primary-hover active:scale-95 shadow-md"
        >
          <Plus className="w-4 h-4" />
          Add Book
        </button>
      </header>

      {/* Library Layout with sidebar custom shelves */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Custom Shelves Sidebar */}
        <aside className="lg:col-span-1 flex flex-col gap-4">
          <div className="flex justify-between items-center p-3 rounded-lg bg-bg-secondary border border-border-neutral">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Custom Shelves</span>
            <button 
              onClick={() => setShowAddCollectionModal(true)}
              className="text-brand-primary hover:text-brand-primary-hover p-1 rounded-full hover:bg-white/4 active:scale-90"
              title="Create Collection"
            >
              <FolderPlus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => setSelectedCollection(null)}
              className={`flex items-center justify-between px-3 py-2.5 rounded text-xs font-medium ${
                selectedCollection === null ? 'bg-white/4 text-text-primary border-l-2 border-brand-primary' : 'text-text-secondary hover:bg-white/2 hover:text-text-primary'
              }`}
            >
              <span>All Shelves</span>
              <span className="text-[10px] text-text-tertiary">{books.length}</span>
            </button>

            {collections.map((col) => (
              <div 
                key={col.id} 
                className={`group flex items-center justify-between px-3 py-1.5 rounded ${
                  selectedCollection === col.id ? 'bg-white/4 text-text-primary border-l-2 border-brand-primary' : 'text-text-secondary hover:bg-white/2 hover:text-text-primary'
                }`}
              >
                <button
                  onClick={() => setSelectedCollection(col.id)}
                  className="flex-1 text-left text-xs font-medium truncate"
                >
                  {col.name}
                </button>
                <button 
                  onClick={() => deleteCollectionMutation.mutate(col.id)}
                  className="opacity-0 group-hover:opacity-100 text-brand-danger hover:text-brand-danger/80 p-1 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </aside>

        {/* Filters and Book List Grid */}
        <main className="lg:col-span-3 flex flex-col gap-5">
          {/* Search and Tabs toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center w-full">
            <div className="relative w-full sm:max-w-xs flex gap-2">
              <div className="relative flex-1">
                {isAiSearch ? (
                  <Sparkles className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary animate-pulse" />
                ) : (
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                )}
                <input
                  type="text"
                  placeholder={isAiSearch ? "Ask AI: 'suggest habit books'..." : "Search title or author..."}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (!e.target.value.trim()) {
                      setAiMatchedIds(null);
                    }
                  }}
                  onKeyDown={handleSearchKeyPress}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-md bg-bg-secondary border text-sm text-text-primary outline-none transition-all placeholder:text-text-tertiary ${
                    isAiSearch ? 'border-brand-primary/40 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary' : 'border-border-neutral focus:border-brand-primary focus:ring-1 focus:ring-brand-primary'
                  }`}
                />
              </div>
              <button
                onClick={() => {
                  setIsAiSearch(!isAiSearch);
                  setSearchQuery('');
                  setAiMatchedIds(null);
                }}
                className={`p-2.5 rounded-md border flex items-center justify-center transition-all ${
                  isAiSearch 
                    ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary' 
                    : 'bg-bg-secondary border-border-neutral text-text-secondary hover:text-text-primary'
                }`}
                title="Toggle AI Semantic Search"
              >
                <Sparkles className="w-4 h-4" />
              </button>
            </div>

            <div className="flex bg-bg-secondary p-1 rounded-md border border-border-neutral w-full sm:w-auto overflow-x-auto justify-around">
              {['all', 'currently-reading', 'completed', 'want-to-read'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-sm text-xs font-bold transition-all capitalize ${
                    activeTab === tab ? 'bg-white/5 text-text-primary' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {tab === 'currently-reading' ? 'Reading' : tab === 'want-to-read' ? 'To Read' : tab}
                </button>
              ))}
            </div>
          </div>

          {/* Book Catalog Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onSelect={(b) => setSelectedBook(b)}
                onStartSession={onStartSession}
              />
            ))}
          </div>

          {filteredBooks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <span className="text-4xl">📚</span>
              <p className="text-sm font-bold text-text-primary">No books found matching criteria</p>
              <p className="text-xs text-text-secondary max-w-xs">Adjust your search query or add a new book to start logging logs.</p>
            </div>
          )}
        </main>
      </div>

      {/* 1. Add Book Modal Bottom Sheet */}
      <Modal isOpen={showAddBookModal} onClose={() => setShowAddBookModal(false)} title="Add New Book">
        <form onSubmit={handleCreateBook} className="flex flex-col gap-4 text-xs font-semibold text-text-secondary">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-wider text-text-secondary">Title</label>
            <input 
              type="text" 
              required
              value={newBookTitle}
              onChange={(e) => setNewBookTitle(e.target.value)}
              className="px-3.5 py-2.5 rounded bg-bg-secondary border border-border-neutral focus:border-brand-primary outline-none text-text-primary"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-wider text-text-secondary">Author</label>
            <input 
              type="text" 
              required
              value={newBookAuthor}
              onChange={(e) => setNewBookAuthor(e.target.value)}
              className="px-3.5 py-2.5 rounded bg-bg-secondary border border-border-neutral focus:border-brand-primary outline-none text-text-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider text-text-secondary">Total Pages</label>
              <input 
                type="number" 
                required
                min={1}
                value={newBookPages}
                onChange={(e) => setNewBookPages(Number(e.target.value))}
                className="px-3.5 py-2.5 rounded bg-bg-secondary border border-border-neutral focus:border-brand-primary outline-none text-text-primary"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider text-text-secondary">Shelf Status</label>
              <select 
                value={newBookStatus}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewBookStatus(e.target.value as 'currently-reading' | 'completed' | 'want-to-read' | 'owned')}
                className="px-3.5 py-2.5 rounded bg-bg-secondary border border-border-neutral focus:border-brand-primary outline-none text-text-primary"
              >
                <option value="owned">Owned Shelf</option>
                <option value="currently-reading">Currently Reading</option>
                <option value="want-to-read">Want to Read</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-wider text-text-secondary">Cover Image URL (Optional)</label>
            <input 
              type="url" 
              value={newBookCover}
              onChange={(e) => setNewBookCover(e.target.value)}
              className="px-3.5 py-2.5 rounded bg-bg-secondary border border-border-neutral focus:border-brand-primary outline-none text-text-primary placeholder:text-text-tertiary"
              placeholder="https://example.com/cover.jpg"
            />
          </div>

          <button 
            type="submit"
            className="mt-4 py-3 rounded bg-brand-primary hover:bg-brand-primary-hover active:scale-98 text-text-inverse font-bold shadow-lg"
          >
            Create Book Profile
          </button>
        </form>
      </Modal>

      {/* 2. Add Collection Modal */}
      <Modal isOpen={showAddCollectionModal} onClose={() => setShowAddCollectionModal(false)} title="Create Custom Shelf">
        <form onSubmit={handleCreateCollection} className="flex flex-col gap-4 text-xs font-semibold text-text-secondary">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-wider text-text-secondary">Shelf Name</label>
            <input 
              type="text" 
              required
              value={newColName}
              onChange={(e) => setNewColName(e.target.value)}
              className="px-3.5 py-2.5 rounded bg-bg-secondary border border-border-neutral focus:border-brand-primary outline-none text-text-primary"
            />
          </div>
          <button 
            type="submit"
            className="mt-2 py-3 rounded bg-brand-primary hover:bg-brand-primary-hover active:scale-98 text-text-inverse font-bold shadow-lg"
          >
            Create Custom Shelf
          </button>
        </form>
      </Modal>

      {/* 3. Detailed Book Drawer Overlay */}
      <Modal isOpen={!!selectedBook} onClose={() => setSelectedBook(null)} title={selectedBook?.title || 'Book Details'}>
        {selectedBook && bookDetails && (
          <div className="flex flex-col gap-6 text-text-secondary">
            {/* Book Info Profile Header */}
            <div className="flex items-center gap-5">
              <div className="w-16 aspect-[2/3] rounded bg-bg-secondary overflow-hidden border border-border-neutral flex-shrink-0 shadow-md">
                {selectedBook.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selectedBook.coverUrl} alt={selectedBook.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-lg text-white/10">{selectedBook.title[0]}</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-extrabold text-text-primary truncate">{selectedBook.title}</h3>
                <p className="text-xs text-text-secondary">by {selectedBook.author}</p>
                <div className="flex gap-2.5 mt-3">
                  <select 
                    value={bookDetails.status}
                    onChange={(e) => updateBookStatusMutation.mutate({ id: selectedBook.id, status: e.target.value })}
                    className="px-2 py-1.5 rounded bg-bg-secondary border border-border-neutral text-[10px] font-bold text-text-primary outline-none"
                  >
                    <option value="owned">Owned</option>
                    <option value="currently-reading">Reading</option>
                    <option value="want-to-read">To Read</option>
                    <option value="completed">Completed</option>
                  </select>

                  {bookDetails.status === 'currently-reading' && (
                    <button 
                      onClick={() => {
                        setSelectedBook(null);
                        onStartSession(selectedBook.id);
                      }}
                      className="px-3 py-1.5 rounded bg-brand-primary text-text-inverse text-[10px] font-bold shadow-md hover:bg-brand-primary-hover active:scale-95"
                    >
                      Start Session
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Progress Bar */}
            {bookDetails.status !== 'want-to-read' && bookDetails.status !== 'owned' && (
              <div className="p-4 rounded-lg bg-bg-tertiary border border-border-neutral flex flex-col gap-2">
                <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-bold">
                  <span>Reading Progress</span>
                  <span>{Math.round((bookDetails.currentPage / bookDetails.totalPages) * 100)}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/4 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-primary transition-all duration-500" 
                    style={{ width: `${(bookDetails.currentPage / bookDetails.totalPages) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-text-tertiary">Page {bookDetails.currentPage} of {bookDetails.totalPages}</span>
              </div>
            )}

            {/* Notes & Highlights Notebook Tab */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs uppercase tracking-wider font-bold text-text-primary border-b border-border-neutral pb-1.5">
                Notebook Notes & Highlights
              </h4>

              {/* Add Entry Form */}
              <form onSubmit={handleAddNote} className="flex flex-col gap-2 bg-bg-tertiary p-3 rounded-lg border border-border-neutral">
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <button 
                      type="button" 
                      onClick={() => setNoteType('note')}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold ${noteType === 'note' ? 'bg-brand-primary text-text-inverse' : 'bg-white/4'}`}
                    >
                      Note
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setNoteType('highlight')}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold ${noteType === 'highlight' ? 'bg-brand-warning text-text-inverse' : 'bg-white/4'}`}
                    >
                      Highlight
                    </button>
                  </div>
                  <input 
                    type="number" 
                    placeholder="Page"
                    value={notePage || ''}
                    onChange={(e) => setNotePage(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-16 px-2 py-1 rounded bg-bg-secondary border border-border-neutral text-[10px] outline-none text-text-primary text-center"
                  />
                </div>
                <textarea 
                  required
                  placeholder="Capture note or quote..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full mt-1.5 p-2 rounded bg-bg-secondary border border-border-neutral text-xs outline-none text-text-primary placeholder:text-text-tertiary min-h-[60px]"
                />
                <button 
                  type="submit"
                  className="mt-1.5 py-2 rounded bg-white/4 hover:bg-white/8 text-[10px] font-bold uppercase active:scale-97 text-text-primary"
                >
                  Save to Notebook
                </button>
              </form>

              {/* Notebook entries list */}
              <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                {bookDetails.notesHighlights.map((n) => (
                  <div key={n.id} className={`p-3 rounded border flex flex-col gap-1.5 relative group bg-bg-tertiary border-border-neutral ${
                    n.type === 'highlight' ? 'border-l-2 border-l-brand-warning' : 'border-l-2 border-l-brand-primary'
                  }`}>
                    <div className="flex justify-between items-start">
                      <span className={`text-[9px] font-bold uppercase ${n.type === 'highlight' ? 'text-brand-warning' : 'text-brand-primary'}`}>
                        {n.type} {n.pageNumber ? `• Page ${n.pageNumber}` : ''}
                      </span>
                      <button 
                        onClick={() => deleteNoteMutation.mutate({ bookId: selectedBook.id, noteId: n.id })}
                        className="opacity-0 group-hover:opacity-100 text-brand-danger hover:text-brand-danger/80 p-0.5 rounded transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-text-primary font-medium leading-relaxed italic">{n.content}</p>
                  </div>
                ))}
                {bookDetails.notesHighlights.length === 0 && (
                  <p className="text-center py-6 text-xs text-text-tertiary">No notes or highlights added yet.</p>
                )}
              </div>
            </div>

            {/* Quick delete button */}
            <button 
              onClick={() => {
                if (confirm('Delete this book and all its logged history?')) {
                  deleteBookMutation.mutate(selectedBook.id);
                }
              }}
              className="mt-4 flex items-center justify-center gap-1.5 py-2.5 border border-brand-danger/20 hover:bg-brand-danger/5 text-xs font-bold text-brand-danger rounded transition-colors active:scale-97"
            >
              <Trash2 className="w-4 h-4" />
              Delete Book Profile
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};
