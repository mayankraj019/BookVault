import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

interface Recommendation {
  id: string;
  title: string;
  author: string;
  pages: number;
  collections: string[];
  coverUrl: string;
  whyRecommended: string;
}

export const AISpace: React.FC = () => {
  const { books, addBook } = useApp();
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [summaryType, setSummaryType] = useState<'takeaways' | 'digest' | 'outline'>('takeaways');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [addedRecommendationIds, setAddedRecommendationIds] = useState<string[]>([]);

  // Set default book selected
  useEffect(() => {
    if (books.length > 0 && !selectedBookId) {
      setSelectedBookId(books[0].id);
    }
  }, [books, selectedBookId]);

  // Generate recommendations based on user library
  useEffect(() => {
    // Look at collections user reads
    const userCollections = Array.from(new Set(books.flatMap(b => b.collections)));
    const hasDesign = userCollections.includes('Design');
    const hasTech = userCollections.includes('Technology');
    const hasPhilosophy = userCollections.includes('Philosophy');

    const list: Recommendation[] = [];

    if (hasDesign || books.some(b => b.id === 'book-1' || b.id === 'book-4')) {
      list.push({
        id: 'rec-1',
        title: 'The Design of Everyday Things',
        author: 'Don Norman',
        pages: 368,
        collections: ['Design', 'Productivity'],
        coverUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=300',
        whyRecommended: 'Since you are exploring design books like "Creative Selection" and "Designing Design", Don Norman\'s foundational rules of affordances and signifiers will complement your library.'
      });
    }

    if (hasTech || books.some(b => b.id === 'book-2')) {
      list.push({
        id: 'rec-2',
        title: 'Zero to One',
        author: 'Peter Thiel',
        pages: 224,
        collections: ['Business', 'Technology'],
        coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=300',
        whyRecommended: 'Given your interest in biographies and business systems, this handbook on startup creation and innovation offers deep contrarian frameworks.'
      });
    }

    if (hasPhilosophy || books.some(b => b.id === 'book-3')) {
      list.push({
        id: 'rec-3',
        title: 'Meditations',
        author: 'Marcus Aurelius',
        pages: 256,
        collections: ['Philosophy'],
        coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=300',
        whyRecommended: 'Because you have "The Creative Act: A Way of Being" in your want-to-read list, this classic text on Stoicism will deepen your perspective on mental discipline and focus.'
      });
    }

    // Default fallbacks if empty
    if (list.length === 0) {
      list.push(
        {
          id: 'rec-1',
          title: 'The Design of Everyday Things',
          author: 'Don Norman',
          pages: 368,
          collections: ['Design'],
          coverUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=300',
          whyRecommended: 'A classic introduction to user-centric engineering and cognitive architecture.'
        },
        {
          id: 'rec-2',
          title: 'Zero to One',
          author: 'Peter Thiel',
          pages: 224,
          collections: ['Business'],
          coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=300',
          whyRecommended: 'Frameworks on building monopolies and driving technological progress.'
        }
      );
    }

    setRecommendations(list);
  }, [books]);

  // Mock generative summary data
  const getPrepackagedSummary = (title: string, type: 'takeaways' | 'digest' | 'outline') => {
    const normTitle = title.toLowerCase();
    
    if (normTitle.includes('creative selection')) {
      if (type === 'takeaways') {
        return `### Key Takeaways from Creative Selection:

1. **Demos are the Supreme Truth**: At Apple, decisions were rarely made based on slideshows or spec sheets. Working prototypes (demos) were the only currency that mattered.
2. **Small, Smart Teams**: The iPhone keyboard and Safari web browser were built by extremely small teams (2-3 engineers) working without middle-management constraints.
3. **Iterative Refinement**: Progress is made by showing a demo, gathering feedback, adjusting, and demonstrating again. Ken Kocienda calls this the "creative selection" loop.
4. **Heuristics & Algorithms**: Resolving the iPhone keyboard required an intersection of auto-correct heuristics and adaptive touch geometry.`;
      } else if (type === 'digest') {
        return `### Chapter Digest:

* **Chapter 1: The Demo**: Focuses on the critical demo Ken gave to Steve Jobs showcasing the initial Safari browser speed, demonstrating the intensity of executive reviews.
* **Chapter 2: The Keyboard Challenge**: Covers the technical hurdle of typing on a small, keyless glass screen. Ken explains the multiple design iterations that failed before finding the key-tap grid.
* **Chapter 3: Simplicity & Taste**: Exploring the invisible intersection of engineering and design values that defined Apple's software culture.`;
      } else {
        return `### Mindmap Outline:

* **Creative Selection Framework**
  * **Core Values**
    * *Inspiration*: Starting with an creative spark.
    * *Collaboration*: Constructive feedback from trusted peers.
    * *Diligence*: Doing the hard work of writing code and fixing bugs.
  * **The Apple Culture**
    * *Steve Jobs' Influence*: Laser focus and high expectations.
    * *Demo-Driven*: Actions speak louder than plans.
  * **Product Engineering**
    * *Safari*: Optimization loops.
    * *iPhone Keyboard*: Software keyboard layout and typing heuristics.`;
      }
    }

    if (normTitle.includes('steve jobs')) {
      if (type === 'takeaways') {
        return `### Key Takeaways from Steve Jobs:

1. **Focus, Cut the Noise**: When Jobs returned to Apple in 1997, he drew a 2x2 matrix (Consumer/Pro, Desktop/Portable) and canceled 90% of Apple's existing hardware projects.
2. **Reality Distortion Field**: Jobs pushed engineers to do what they thought was impossible, often succeeding through sheer refuse to accept failure.
3. **End-to-End Control**: A deep belief that hardware and software must be fully integrated to deliver a magical, seamless user experience.
4. **The Intersection of Liberal Arts & Technology**: Products must have soul, combining technology with humanistic design, beauty, and ergonomics.`;
      } else if (type === 'digest') {
        return `### Chapter Digest:

* **Part 1: The Creative Roots**: Detail on Jobs' childhood, exposure to mechanics, early calligraphy classes, and the founding of Apple in his garage.
* **Part 2: The Wilderness Years**: The creation of NeXT and Pixar, which laid the technology foundations for Apple's eventual return.
* **Part 3: The Golden Age**: The launching of the iMac, iPod, iPhone, and iPad, which transformed multiple global industries.`;
      } else {
        return `### Mindmap Outline:

* **The Visionary Principles**
  * **Design Ethics**
    * *Simplicity*: Peeling back complex elements.
    * *Craftsmanship*: Making the parts unseen beautiful (back of the cabinet).
  * **Business Strategy**
    * *Product Focus*: Fewer projects, higher quality.
    * *Monolithic Integration*: Fully closed ecosystem.
  * **Team Leadership**
    * *A-Players Only*: Zero tolerance for mediocrity.
    * *Collaboration*: The Pixar building layout to encourage accidental run-ins.`;
      }
    }

    if (normTitle.includes('designing design')) {
      if (type === 'takeaways') {
        return `### Key Takeaways from Designing Design:

1. **Re-Design the Mundane**: Kenya Hara argues that design is not about creating things that have never existed; it is about re-examining the items we take for granted (like matches, tea bags, or toilet paper).
2. **The Philosophy of Emptiness (Mu)**: Japanese aesthetics values "emptiness" over "simplicity". Simplicity is a cleanup tool; Emptiness is a vessel that allows the user's mind to fill in the meaning.
3. **Exformation**: Instead of making information easily accessible, design can show how little we actually know, stimulating curiosity.
4. **Sensory Marketing**: The texture, weight, and touch of paper or materials communicate values far deeper than text labels.`;
      } else if (type === 'digest') {
        return `### Chapter Digest:

* **Section 1: Re-design Project**: Documents the collaborative effort where leading designers re-designed everyday items to demonstrate how deep simple design can go.
* **Section 2: Haptic Architecture**: Investigates how we perceive design through touch, texture, and physical presence rather than just vision.
* **Section 3: Sense Ware**: How materials dictate product possibilities.`;
      } else {
        return `### Mindmap Outline:

* **Kenya Hara's Framework**
  * **Emptiness vs Simplicity**
    * *Emptiness (Mu)*: Interactive vessel.
    * *Simplicity*: Functional optimization.
  * **Design of Sense**
    * *Haptics*: The texture of objects.
    * *Memory*: Triggering past feelings through clean shapes.
  * **Exformation**
    * *Curiosity*: Creating questions, not just answers.
    * *Un-knowing*: Re-evaluating what we think we know.`;
      }
    }

    return '';
  };

  // Run Mock Summary Generator
  const handleGenerateSummary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookId) return;

    const book = books.find(b => b.id === selectedBookId);
    if (!book) return;

    setIsGenerating(true);
    setGeneratedResult(null);

    setTimeout(() => {
      const prepackaged = getPrepackagedSummary(book.title, summaryType);
      
      if (prepackaged) {
        setGeneratedResult(prepackaged);
      } else {
        // Dynamic summary fallback for user-added custom books
        const dynamicSummary = `### AI Summary of ${book.title}
*by ${book.author}*

> **Disclaimer**: This is an AI-generated analysis based on reading statistics and book metadata.

#### 🎯 Key Concepts
1. **Core Premise**: The book explores structural strategies in the context of its genre. ${book.author} frames these challenges through chronological development and case examples.
2. **Critical Frameworks**: The text establishes that optimizing small, targeted inputs leads to compounding improvements, analogous to reading streaks.
3. **Application**: The author encourages readers to take notes, capture highlights, and analyze progress periodically to lock in learning.

#### 💡 Actionable Insights for BookVault Users
- **Chapter Focus**: Set dedicated, distraction-free focus sessions when reading the dense middle chapters of this book.
- **Goal Connection**: Given this book is ${book.totalPages} pages long, reading for 20 minutes a day will complete it in approximately ${Math.ceil(book.totalPages / 20)} days.`;
        setGeneratedResult(dynamicSummary);
      }
      setIsGenerating(false);
    }, 1500);
  };

  const handleAddRecToLibrary = (rec: Recommendation) => {
    addBook({
      title: rec.title,
      author: rec.author,
      totalPages: rec.pages,
      currentPage: 0,
      coverUrl: rec.coverUrl,
      status: 'want-to-read',
      collections: rec.collections
    });
    setAddedRecommendationIds(prev => [...prev, rec.id]);
  };

  return (
    <div className="ai-space-view fade-in">
      <header className="ai-header">
        <h2>BookVault AI Space</h2>
      </header>

      <div className="ai-grid">
        {/* Left Column: AI Summarizer Panel */}
        <section className="ai-panel glass-panel summarizer-panel">
          <div className="ai-panel-header">
            <span className="ai-icon">✨</span>
            <h3 className="panel-title">AI Book Summarizer</h3>
          </div>

          {books.length > 0 ? (
            <form onSubmit={handleGenerateSummary} className="summarizer-form">
              <div className="form-group">
                <label className="form-label">Select Book</label>
                <select 
                  className="form-select" 
                  value={selectedBookId} 
                  onChange={e => setSelectedBookId(e.target.value)}
                >
                  {books.map(b => (
                    <option key={b.id} value={b.id}>{b.title} ({b.author})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Summary Model Type</label>
                <div className="summary-type-grid">
                  {[
                    { id: 'takeaways', label: 'Key Takeaways' },
                    { id: 'digest', label: 'Chapter Digest' },
                    { id: 'outline', label: 'Mindmap Outline' }
                  ].map(t => (
                    <button
                      type="button"
                      key={t.id}
                      className={`type-btn ${summaryType === t.id ? 'active' : ''}`}
                      onClick={() => setSummaryType(t.id as any)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn btn-primary generate-btn" disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <div className="spinner"></div>
                    Parsing Book Chapters...
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 2 22 22 22 12 2" fill="currentColor" opacity="0.2" />
                      <line x1="12" y1="18" x2="12" y2="10" />
                      <circle cx="12" cy="6" r="1" />
                    </svg>
                    Generate AI Summary
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="summarizer-empty">
              <p>Add books to your library to generate AI summaries and key takeaways.</p>
            </div>
          )}

          {/* Result Output */}
          {generatedResult && (
            <div className="summary-result-box glass-panel fade-in">
              <div className="result-header">
                <span className="result-tag">AI Generated Summary</span>
              </div>
              <div className="result-content">
                {generatedResult.split('\n\n').map((paragraph, index) => {
                  if (paragraph.startsWith('###') || paragraph.startsWith('####')) {
                    const cleanText = paragraph.replace(/#+\s+/, '');
                    return <h4 key={index} className="result-heading">{cleanText}</h4>;
                  }
                  if (paragraph.includes('\n* ') || paragraph.includes('\n1. ') || paragraph.startsWith('1. ') || paragraph.startsWith('* ')) {
                    // Render simple lists
                    const lines = paragraph.split('\n');
                    return (
                      <ul key={index} className="result-list">
                        {lines.map((line, lIdx) => {
                          const cleanLine = line.replace(/^(\*|\d+\.)\s+/, '').replace(/\*\*(.*?)\*\*/g, '$1');
                          return <li key={lIdx}>{cleanLine}</li>;
                        })}
                      </ul>
                    );
                  }
                  // Normal paragraph
                  return <p key={index}>{paragraph.replace(/\*\*(.*?)\*\*/g, '$1')}</p>;
                })}
              </div>
            </div>
          )}
        </section>

        {/* Right Column: AI Recommendations */}
        <section className="ai-panel glass-panel recommendations-panel">
          <div className="ai-panel-header">
            <span className="ai-icon">🎯</span>
            <h3 className="panel-title">AI Recommendations</h3>
          </div>

          <div className="recommendations-list">
            {recommendations.map(rec => {
              const isAdded = addedRecommendationIds.includes(rec.id);
              return (
                <div key={rec.id} className="rec-card glass-panel">
                  <div className="rec-cover-wrapper">
                    <img src={rec.coverUrl} alt={rec.title} className="rec-cover" />
                  </div>
                  <div className="rec-details">
                    <h4 className="rec-title">{rec.title}</h4>
                    <span className="rec-author">by {rec.author}</span>
                    <div className="rec-badges-row">
                      {rec.collections.map(c => (
                        <span key={c} className="collection-badge">{c}</span>
                      ))}
                    </div>
                    <p className="rec-reason">{rec.whyRecommended}</p>
                    
                    <button
                      className={`btn btn-sm ${isAdded ? 'btn-secondary' : 'btn-primary'}`}
                      onClick={() => !isAdded && handleAddRecToLibrary(rec)}
                      disabled={isAdded}
                    >
                      {isAdded ? '✓ Shelved in Library' : 'Add to "Want to Read"'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <style>{`
        .ai-space-view {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .ai-header h2 {
          font-size: 2.2rem;
          font-weight: 800;
          font-family: var(--font-heading);
          background: linear-gradient(to right, #ffffff, #9ca3af);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .ai-grid {
          display: grid;
          grid-template-columns: 1fr 440px;
          gap: 24px;
          align-items: start;
        }

        .ai-panel {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .ai-panel-header {
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 1px solid var(--border-neutral);
          padding-bottom: 14px;
        }

        .ai-icon {
          font-size: 1.3rem;
        }

        .panel-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        /* Summarizer form styles */
        .summarizer-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .summary-type-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .type-btn {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-neutral);
          color: var(--text-secondary);
          padding: 8px 10px;
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          cursor: pointer;
          font-weight: 600;
          transition: var(--transition-smooth);
        }

        .type-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.06);
        }

        .type-btn.active {
          background: var(--color-primary-light);
          color: var(--color-primary);
          border-color: var(--color-primary);
        }

        .generate-btn {
          font-weight: 700;
        }

        .summarizer-empty {
          color: var(--text-secondary);
          text-align: center;
          padding: 24px;
        }

        /* Loading spinner */
        .spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Summary results container styling */
        .summary-result-box {
          padding: 20px;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--border-neutral);
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .result-header {
          display: flex;
          align-items: center;
        }

        .result-tag {
          font-size: 0.65rem;
          background: rgba(16, 185, 129, 0.15);
          color: var(--color-success);
          padding: 3px 8px;
          border-radius: var(--radius-full);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .result-content {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.5;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .result-heading {
          font-size: 1rem;
          color: var(--text-primary);
          margin-top: 8px;
          font-weight: 700;
        }

        .result-list {
          padding-left: 20px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .result-list li {
          list-style-type: decimal;
        }

        /* Recommendations column styles */
        .recommendations-list {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .rec-card {
          padding: 16px;
          display: flex;
          gap: 16px;
          align-items: start;
        }

        .rec-card:hover {
          transform: none; /* remove hover translation */
          border-color: rgba(255, 255, 255, 0.1);
        }

        .rec-cover-wrapper {
          width: 70px;
          aspect-ratio: 2/3;
          border-radius: var(--radius-sm);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
        }

        .rec-cover {
          width: 100%; height: 100%; object-fit: cover;
        }

        .rec-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .rec-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .rec-author {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .rec-badges-row {
          display: flex;
          gap: 4px;
          margin: 4px 0;
        }

        .collection-badge {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-neutral);
          color: var(--text-secondary);
          font-size: 0.65rem;
          padding: 1px 6px;
          border-radius: var(--radius-sm);
        }

        .rec-reason {
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.4;
          margin-bottom: 10px;
        }

        @media (max-width: 1024px) {
          .ai-grid {
            display: flex;
            flex-direction: column;
          }
          .ai-panel {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};
