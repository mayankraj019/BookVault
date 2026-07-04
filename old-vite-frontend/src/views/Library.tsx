import React, { useState } from 'react';
import { useApp, type Book } from '../context/AppContext';
import { BookCard } from '../components/BookCard';
import { Modal } from '../components/Modal';

interface LibraryProps {
  onStartSession: (bookId: string) => void;
}

export const Library: React.FC<LibraryProps> = ({ onStartSession }) => {
  const { 
    books, 
    collections, 
    addBook, 
    updateBook, 
    deleteBook, 
    addCollection, 
    deleteCollection,
    addNote,
    addHighlight,
    deleteNote,
    deleteHighlight
  } = useApp();

  // Active view tab and filters
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('title');

  // Modal controls
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showNewCollectionInput, setShowNewCollectionInput] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  // Add Book Form State
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [newBookPages, setNewBookPages] = useState<number>(300);
  const [newBookStatus, setNewBookStatus] = useState<Book['status']>('currently-reading');
  const [newBookCover, setNewBookCover] = useState('');
  const [newBookCollections, setNewBookCollections] = useState<string[]>([]);

  // Note/Highlight Inputs
  const [noteContent, setNoteContent] = useState('');
  const [notePage, setNotePage] = useState<number>(1);
  const [highlightContent, setHighlightContent] = useState('');
  const [highlightPage, setHighlightPage] = useState<number>(1);

  // Filter books
  const getFilteredBooks = () => {
    let list = [...books];

    // Filter by tab
    if (activeTab !== 'all') {
      list = list.filter(b => b.status === activeTab);
    }

    // Filter by collection
    if (selectedCollection) {
      list = list.filter(b => b.collections.includes(selectedCollection));
    }

    // Filter by search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(b => 
        b.title.toLowerCase().includes(q) || 
        b.author.toLowerCase().includes(q)
      );
    }

    // Sort list
    list.sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'author') return a.author.localeCompare(b.author);
      if (sortBy === 'pages') return b.totalPages - a.totalPages;
      if (sortBy === 'progress') {
        const progA = a.totalPages > 0 ? a.currentPage / a.totalPages : 0;
        const progB = b.totalPages > 0 ? b.currentPage / b.totalPages : 0;
        return progB - progA;
      }
      return 0;
    });

    return list;
  };

  const filteredBooks = getFilteredBooks();

  // Handle Add Book Submission
  const handleAddBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Choose a fallback cover if empty
    const coverUrl = newBookCover.trim() || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=300';
    
    addBook({
      title: newBookTitle,
      author: newBookAuthor,
      totalPages: newBookPages,
      currentPage: newBookStatus === 'completed' ? newBookPages : 0,
      coverUrl,
      status: newBookStatus,
      collections: newBookCollections
    });

    // Reset Form
    setNewBookTitle('');
    setNewBookAuthor('');
    setNewBookPages(300);
    setNewBookStatus('currently-reading');
    setNewBookCover('');
    setNewBookCollections([]);
    setShowAddBookModal(false);
  };

  const handleToggleCollectionInForm = (colName: string) => {
    setNewBookCollections(prev => 
      prev.includes(colName) 
        ? prev.filter(c => c !== colName) 
        : [...prev, colName]
    );
  };

  const handleAddCollectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCollectionName.trim()) {
      addCollection(newCollectionName.trim());
      setNewCollectionName('');
      setShowNewCollectionInput(false);
    }
  };

  const handleBookSelect = (book: Book) => {
    setSelectedBook(book);
    setNotePage(book.currentPage || 1);
    setHighlightPage(book.currentPage || 1);
  };

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBook && noteContent.trim()) {
      addNote(selectedBook.id, notePage, noteContent.trim());
      setNoteContent('');
      // Sync detailed book state
      const updated = books.find(b => b.id === selectedBook.id);
      if (updated) setSelectedBook(updated);
    }
  };

  const handleAddHighlightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBook && highlightContent.trim()) {
      addHighlight(selectedBook.id, highlightPage, highlightContent.trim());
      setHighlightContent('');
      // Sync detailed book state
      const updated = books.find(b => b.id === selectedBook.id);
      if (updated) setSelectedBook(updated);
    }
  };

  const handleBookDelete = (bookId: string) => {
    if (confirm('Are you sure you want to delete this book? This will clear all its read logs, notes, and highlights.')) {
      deleteBook(bookId);
      setSelectedBook(null);
    }
  };

  const handleStatusChange = (status: Book['status']) => {
    if (!selectedBook) return;
    updateBook(selectedBook.id, { status });
    // Sync UI
    const updated = books.find(b => b.id === selectedBook.id);
    if (updated) setSelectedBook(updated);
  };

  const handlePageUpdate = (e: React.FormEvent, page: number) => {
    e.preventDefault();
    if (!selectedBook) return;
    updateBook(selectedBook.id, { currentPage: page });
    const updated = books.find(b => b.id === selectedBook.id);
    if (updated) setSelectedBook(updated);
  };

  return (
    <div className="library-view fade-in">
      <header className="library-header">
        <h2>My Library</h2>
        <button className="btn btn-primary" onClick={() => setShowAddBookModal(true)}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Book
        </button>
      </header>

      {/* Main Layout Grid (Filter Toolbar + Content) */}
      <div className="library-layout">
        
        {/* Left Sidebar: Collections */}
        <aside className="library-collections-sidebar glass-panel">
          <div className="sidebar-section-header">
            <h3>Collections</h3>
            <button className="add-col-btn" onClick={() => setShowNewCollectionInput(!showNewCollectionInput)}>
              ✕
            </button>
          </div>

          {showNewCollectionInput && (
            <form onSubmit={handleAddCollectionSubmit} className="new-col-form">
              <input
                type="text"
                className="form-input col-input"
                placeholder="Name..."
                value={newCollectionName}
                onChange={e => setNewCollectionName(e.target.value)}
                autoFocus
                required
              />
              <button type="submit" className="btn btn-primary btn-icon-only">✓</button>
            </form>
          )}

          <div className="collections-list">
            <button
              className={`col-item-btn ${selectedCollection === null ? 'active' : ''}`}
              onClick={() => setSelectedCollection(null)}
            >
              <span>📁 All Books</span>
              <span className="col-count">{books.length}</span>
            </button>
            
            {collections.map(c => {
              const count = books.filter(b => b.collections.includes(c)).length;
              return (
                <div key={c} className="col-item-wrapper">
                  <button
                    className={`col-item-btn ${selectedCollection === c ? 'active' : ''}`}
                    onClick={() => setSelectedCollection(c)}
                  >
                    <span>🏷️ {c}</span>
                    <span className="col-count">{count}</span>
                  </button>
                  <button className="col-del-btn" onClick={() => deleteCollection(c)} title={`Delete ${c} collection`}>
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Right Section: Books Grid */}
        <div className="library-main-panel">
          {/* Controls Bar */}
          <div className="library-controls glass-panel">
            <div className="search-wrapper">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="search-icon">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search by title, author..."
                className="controls-search-input"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filters-row">
              <div className="tabs-container">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'currently-reading', label: 'Reading' },
                  { id: 'want-to-read', label: 'To Read' },
                  { id: 'completed', label: 'Finished' },
                  { id: 'owned', label: 'Owned' }
                ].map(t => (
                  <button
                    key={t.id}
                    className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(t.id)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="sort-wrapper">
                <label>Sort:</label>
                <select className="form-select sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  <option value="title">Title (A-Z)</option>
                  <option value="author">Author</option>
                  <option value="pages">Pages</option>
                  <option value="progress">Progress (%)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Book Catalog Grid */}
          {filteredBooks.length > 0 ? (
            <div className="book-grid">
              {filteredBooks.map(book => (
                <BookCard
                  key={book.id}
                  book={book}
                  onSelect={handleBookSelect}
                  onStartSession={onStartSession}
                />
              ))}
            </div>
          ) : (
            <div className="library-empty glass-panel">
              <span className="empty-book-icon">📖</span>
              <h3>No books matching your query</h3>
              <p>Try clearing filters or search queries, or add a new book to start your collection.</p>
              <button className="btn btn-secondary" onClick={() => {
                setActiveTab('all');
                setSelectedCollection(null);
                setSearchQuery('');
              }}>
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Book Details Sliding Modal Overlay */}
      {selectedBook && (
        <div className="details-overlay fade-in" onClick={() => setSelectedBook(null)}>
          <div className="details-drawer glass-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-drag-handle"></div>
            <header className="drawer-header">
              <button className="btn-ghost back-btn" onClick={() => setSelectedBook(null)}>
                ← Close
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => handleBookDelete(selectedBook.id)}>
                Delete Book
              </button>
            </header>

            <div className="drawer-body">
              <div className="drawer-book-profile">
                <div className="drawer-cover">
                  {selectedBook.coverUrl ? (
                    <img src={selectedBook.coverUrl} alt={selectedBook.title} />
                  ) : (
                    <div className="drawer-cover-fallback">{selectedBook.title[0]}</div>
                  )}
                </div>
                <div className="drawer-meta">
                  <h3>{selectedBook.title}</h3>
                  <p className="drawer-author">by {selectedBook.author}</p>
                  
                  <div className="drawer-status-editor">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={selectedBook.status}
                      onChange={e => handleStatusChange(e.target.value as Book['status'])}
                    >
                      <option value="currently-reading">Currently Reading</option>
                      <option value="completed">Completed</option>
                      <option value="want-to-read">Want to Read</option>
                      <option value="owned">Owned</option>
                    </select>
                  </div>

                  {selectedBook.status === 'currently-reading' && (
                    <form 
                      onSubmit={(e) => {
                        const target = e.target as HTMLFormElement;
                        const page = parseInt(target.page.value) || 0;
                        handlePageUpdate(e, page);
                      }}
                      className="drawer-page-form"
                    >
                      <label className="form-label">Progress</label>
                      <div className="page-input-row">
                        <input
                          type="number"
                          name="page"
                          className="form-input page-num-input"
                          defaultValue={selectedBook.currentPage}
                          min="0"
                          max={selectedBook.totalPages}
                        />
                        <span>/ {selectedBook.totalPages} pages</span>
                        <button type="submit" className="btn btn-secondary btn-sm">Update</button>
                      </div>
                    </form>
                  )}
                </div>
              </div>

              {/* Collections badge manager */}
              <div className="drawer-collections-section">
                <span className="form-label">Shelved in</span>
                <div className="drawer-badge-row">
                  {selectedBook.collections.length > 0 ? (
                    selectedBook.collections.map(c => (
                      <span key={c} className="collection-badge-tag">{c}</span>
                    ))
                  ) : (
                    <span className="no-badge-lbl">No custom collections. Edit book to add shelves.</span>
                  )}
                </div>
              </div>

              {/* Tabs: Notes vs Highlights */}
              <div className="drawer-notebook">
                
                {/* Notes Column */}
                <div className="notebook-column">
                  <h4 className="notebook-title">Notes ({selectedBook.notes.length})</h4>
                  <form onSubmit={handleAddNoteSubmit} className="notebook-add-form">
                    <textarea
                      placeholder="Jot down a quick thought or takeaway..."
                      className="form-textarea notebook-textarea"
                      value={noteContent}
                      onChange={e => setNoteContent(e.target.value)}
                      required
                    ></textarea>
                    <div className="notebook-add-row">
                      <div className="notebook-page-field">
                        <span>Page</span>
                        <input
                          type="number"
                          className="form-input"
                          min="0"
                          max={selectedBook.totalPages}
                          value={notePage}
                          onChange={e => setNotePage(parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <button type="submit" className="btn btn-primary btn-sm">Add Note</button>
                    </div>
                  </form>

                  <div className="notebook-list">
                    {selectedBook.notes.map(note => (
                      <div key={note.id} className="notebook-item">
                        <div className="notebook-item-meta">
                          <span>Page {note.page}</span>
                          <button className="del-text-btn" onClick={() => {
                            deleteNote(selectedBook.id, note.id);
                            // Sync detailed UI
                            const updated = books.find(b => b.id === selectedBook.id);
                            if (updated) setSelectedBook(updated);
                          }}>Delete</button>
                        </div>
                        <p className="notebook-text">{note.content}</p>
                        <span className="notebook-date">{note.date}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Highlights Column */}
                <div className="notebook-column">
                  <h4 className="notebook-title">Highlights ({selectedBook.highlights.length})</h4>
                  <form onSubmit={handleAddHighlightSubmit} className="notebook-add-form">
                    <textarea
                      placeholder="Paste a beautiful quote or passage..."
                      className="form-textarea notebook-textarea"
                      value={highlightContent}
                      onChange={e => setHighlightContent(e.target.value)}
                      required
                    ></textarea>
                    <div className="notebook-add-row">
                      <div className="notebook-page-field">
                        <span>Page</span>
                        <input
                          type="number"
                          className="form-input"
                          min="0"
                          max={selectedBook.totalPages}
                          value={highlightPage}
                          onChange={e => setHighlightPage(parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <button type="submit" className="btn btn-primary btn-sm">Add Highlight</button>
                    </div>
                  </form>

                  <div className="notebook-list">
                    {selectedBook.highlights.map(hl => (
                      <div key={hl.id} className="notebook-item highlight-item">
                        <div className="notebook-item-meta">
                          <span>Page {hl.page}</span>
                          <button className="del-text-btn" onClick={() => {
                            deleteHighlight(selectedBook.id, hl.id);
                            const updated = books.find(b => b.id === selectedBook.id);
                            if (updated) setSelectedBook(updated);
                          }}>Delete</button>
                        </div>
                        <p className="notebook-text">"{hl.content}"</p>
                        <span className="notebook-date">{hl.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Book Modal */}
      <Modal isOpen={showAddBookModal} onClose={() => setShowAddBookModal(false)} title="Add New Book">
        <form onSubmit={handleAddBookSubmit} className="add-book-form">
          <div className="form-group">
            <label className="form-label">Book Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Design Systems"
              value={newBookTitle}
              onChange={e => setNewBookTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Author Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Alla Kholmatova"
              value={newBookAuthor}
              onChange={e => setNewBookAuthor(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Total Pages</label>
              <input
                type="number"
                className="form-input"
                min="1"
                value={newBookPages}
                onChange={e => setNewBookPages(parseInt(e.target.value) || 0)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Initial Status</label>
              <select
                className="form-select"
                value={newBookStatus}
                onChange={e => setNewBookStatus(e.target.value as Book['status'])}
              >
                <option value="currently-reading">Currently Reading</option>
                <option value="want-to-read">Want to Read</option>
                <option value="completed">Completed</option>
                <option value="owned">Owned</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Cover Image URL (Optional)</label>
            <input
              type="url"
              className="form-input"
              placeholder="Paste a URL or leave empty for gradient cover"
              value={newBookCover}
              onChange={e => setNewBookCover(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Assign to Collections</label>
            <div className="collections-checkbox-grid">
              {collections.map(c => (
                <button
                  type="button"
                  key={c}
                  className={`col-checkbox-btn ${newBookCollections.includes(c) ? 'selected' : ''}`}
                  onClick={() => handleToggleCollectionInForm(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="modal-footer-btns">
            <button type="button" className="btn btn-secondary" onClick={() => setShowAddBookModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add to Catalog
            </button>
          </div>
        </form>
      </Modal>

      <style>{`
        .library-view {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .library-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .library-header h2 {
          font-size: 2.2rem;
          font-weight: 800;
          font-family: var(--font-heading);
          background: linear-gradient(to right, #ffffff, #9ca3af);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .library-layout {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 24px;
          align-items: start;
        }

        /* Collections sidebar styling */
        .library-collections-sidebar {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .sidebar-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .sidebar-section-header h3 {
          font-size: 0.95rem;
          color: var(--text-primary);
        }

        .add-col-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 1.1rem;
          transform: rotate(45deg);
          transition: var(--transition-smooth);
        }

        .add-col-btn:hover {
          color: var(--text-primary);
        }

        .new-col-form {
          display: flex;
          gap: 6px;
        }

        .col-input {
          padding: 6px 10px;
          font-size: 0.8rem;
          border-radius: var(--radius-sm);
        }

        .btn-icon-only {
          padding: 6px 12px;
        }

        .collections-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .col-item-wrapper {
          display: flex;
          align-items: center;
          position: relative;
        }

        .col-item-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 10px;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 550;
          border-radius: var(--radius-sm);
          text-align: left;
          transition: var(--transition-smooth);
        }

        .col-item-btn:hover {
          background: rgba(255, 255, 255, 0.03);
          color: var(--text-primary);
        }

        .col-item-btn.active {
          background: var(--color-primary-light);
          color: var(--color-primary);
        }

        .col-count {
          font-size: 0.7rem;
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-tertiary);
          padding: 2px 6px;
          border-radius: var(--radius-full);
          font-weight: 700;
        }

        .col-item-btn.active .col-count {
          background: rgba(129, 140, 248, 0.2);
          color: var(--color-primary);
        }

        .col-del-btn {
          position: absolute;
          right: 32px;
          opacity: 0;
          background: transparent;
          border: none;
          color: var(--color-danger);
          cursor: pointer;
          font-size: 0.75rem;
          transition: var(--transition-smooth);
        }

        .col-item-wrapper:hover .col-del-btn {
          opacity: 1;
        }

        /* Right panel grid and sorting */
        .library-main-panel {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .library-controls {
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .search-wrapper {
          position: relative;
          width: 100%;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-secondary);
        }

        .controls-search-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-neutral);
          border-radius: var(--radius-md);
          padding: 12px 16px 12px 42px;
          font-size: 0.95rem;
          outline: none;
          transition: var(--transition-smooth);
        }

        .controls-search-input:focus {
          border-color: var(--color-primary);
          background: rgba(255, 255, 255, 0.06);
          box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.15);
        }

        .filters-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }

        .tabs-container {
          display: flex;
          background: rgba(255, 255, 255, 0.03);
          padding: 4px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-neutral);
        }

        .tab-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          padding: 8px 16px;
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .tab-btn:hover {
          color: var(--text-primary);
        }

        .tab-btn.active {
          background: rgba(255, 255, 255, 0.07);
          color: var(--text-primary);
          box-shadow: var(--shadow-sm);
        }

        .sort-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .sort-select {
          padding: 6px 10px;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          background: rgba(255, 255, 255, 0.03);
        }

        .book-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 20px;
        }

        .library-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 12px;
          padding: 48px;
          color: var(--text-secondary);
        }

        .empty-book-icon {
          font-size: 3.5rem;
        }

        .library-empty p {
          max-width: 320px;
          font-size: 0.9rem;
          margin-bottom: 8px;
        }

        /* sliding drawer details overlay styling */
        .details-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(4, 6, 10, 0.7);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 2500;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        .details-drawer {
          width: 100%;
          height: 85vh;
          border-radius: 24px 24px 0 0;
          border-top: 1px solid var(--border-neutral);
          border-left: none; border-bottom: none; border-right: none;
          background: var(--bg-glass);
          backdrop-filter: blur(12px) saturate(180%);
          -webkit-backdrop-filter: blur(12px) saturate(180%);
          box-shadow: var(--shadow-lg);
          display: flex;
          flex-direction: column;
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .details-drawer:hover {
          transform: none;
          box-shadow: var(--shadow-lg);
        }

        .drawer-header {
          padding: 12px 24px 20px 24px;
          border-bottom: 1px solid var(--border-neutral);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-drag-handle {
          width: 36px;
          height: 4px;
          background: rgba(255, 255, 255, 0.15);
          border-radius: var(--radius-full);
          margin: 12px auto 0 auto;
        }

        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        @media (min-width: 1024px) {
          .details-overlay {
            align-items: stretch;
            justify-content: flex-end;
          }

          .details-drawer {
            max-width: 650px;
            height: 100%;
            border-radius: 0;
            border-left: 1px solid var(--border-neutral);
            border-top: none;
            animation: none;
          }

          .modal-drag-handle {
            display: none;
          }

          .drawer-header {
            padding: 20px 24px;
          }
        }

        .back-btn {
          font-weight: 600;
        }

        .drawer-body {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .drawer-book-profile {
          display: flex;
          gap: 24px;
          align-items: flex-start;
        }

        .drawer-cover {
          width: 120px;
          aspect-ratio: 2/3;
          border-radius: var(--radius-sm);
          overflow: hidden;
          box-shadow: var(--shadow-md);
        }

        .drawer-cover img {
          width: 100%; height: 100%; object-fit: cover;
        }

        .drawer-cover-fallback {
          width: 100%; height: 100%;
          background: var(--bg-tertiary);
          display: flex; align-items: center; justify-content: center;
          font-size: 3rem; font-weight: 700;
        }

        .drawer-meta {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .drawer-meta h3 {
          font-size: 1.5rem;
          color: var(--text-primary);
        }

        .drawer-author {
          font-size: 0.95rem;
          color: var(--text-secondary);
          margin-bottom: 12px;
        }

        .drawer-status-editor, .drawer-page-form {
          margin-top: 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .page-input-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .page-num-input {
          width: 80px;
          padding: 6px 10px;
          font-size: 0.85rem;
        }

        .drawer-collections-section {
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border-neutral);
        }

        .drawer-badge-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 8px;
        }

        .collection-badge-tag {
          font-size: 0.75rem;
          background: var(--color-primary-light);
          color: var(--color-primary);
          padding: 4px 10px;
          border-radius: var(--radius-sm);
          font-weight: 600;
        }

        .no-badge-lbl {
          font-size: 0.8rem;
          color: var(--text-tertiary);
        }

        /* Drawer Notebook area (Notes / Highlights side by side) */
        .drawer-notebook {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .notebook-column {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .notebook-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
          border-bottom: 1px solid var(--border-neutral);
          padding-bottom: 6px;
        }

        .notebook-add-form {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .notebook-textarea {
          font-size: 0.8rem;
          min-height: 70px;
          padding: 8px 12px;
          border-radius: var(--radius-sm);
        }

        .notebook-add-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .notebook-page-field {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .notebook-page-field input {
          width: 50px;
          padding: 4px 6px;
          font-size: 0.75rem;
        }

        .notebook-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 250px;
          overflow-y: auto;
          margin-top: 10px;
        }

        .notebook-item {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-neutral);
          border-radius: var(--radius-sm);
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .highlight-item {
          border-left: 3px solid var(--color-warning);
        }

        .notebook-item-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.7rem;
          color: var(--color-primary);
          font-weight: 700;
        }

        .del-text-btn {
          background: transparent;
          border: none;
          color: var(--color-danger);
          font-size: 0.7rem;
          cursor: pointer;
        }

        .notebook-text {
          font-size: 0.8rem;
          color: var(--text-primary);
          line-height: 1.35;
        }

        .notebook-date {
          font-size: 0.65rem;
          color: var(--text-tertiary);
          align-self: flex-end;
        }

        /* Add Book Modal Specifics */
        .add-book-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .collections-checkbox-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 4px;
        }

        .col-checkbox-btn {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-neutral);
          color: var(--text-secondary);
          padding: 6px 12px;
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          cursor: pointer;
          font-weight: 550;
          transition: var(--transition-smooth);
        }

        .col-checkbox-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.06);
        }

        .col-checkbox-btn.selected {
          background: var(--color-primary-light);
          color: var(--color-primary);
          border-color: var(--color-primary);
        }

        @media (max-width: 1024px) {
          .library-layout {
            display: flex;
            flex-direction: column;
          }
          .library-collections-sidebar {
            width: 100%;
          }
          .drawer-notebook {
            grid-template-columns: 1fr;
          }
          .details-drawer {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
};
