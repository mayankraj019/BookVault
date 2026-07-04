'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../utils/api';
import { Book } from '../types';
import { 
  Sparkles, 
  FileText, 
  Lightbulb, 
  MessageSquare, 
  HelpCircle, 
  CreditCard,
  Send,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatMessage {
  sender: 'user' | 'coach';
  text: string;
}

interface Flashcard {
  question: string;
  answer: string;
}

export const AISpace: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'summaries' | 'coach' | 'flashcards' | 'insights'>('summaries');
  
  // Summaries & Q&A states
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [summaryType, setSummaryType] = useState<string>('takeaways');
  const [generatedSummary, setGeneratedSummary] = useState<string | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(false);
  const [bookQuestion, setBookQuestion] = useState<string>('');
  const [qaAnswer, setQaAnswer] = useState<string | null>(null);
  const [isLoadingQA, setIsLoadingQA] = useState<boolean>(false);

  // Coach states
  const [coachInput, setCoachInput] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { sender: 'coach', text: "Hello! I am your BookVault Reading Coach. Ask me anything about building reading habits, retaining ideas, or staying motivated!" }
  ]);
  const [isLoadingCoach, setIsLoadingCoach] = useState<boolean>(false);

  // Flashcard states
  const [flashcardBookId, setFlashcardBookId] = useState<string>('');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoadingFlashcards, setIsLoadingFlashcards] = useState<boolean>(false);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // Fetch user's books
  const { data: books = [] } = useQuery<Book[]>({
    queryKey: ['books'],
    queryFn: () => apiRequest<Book[]>('/books'),
  });

  // Fetch insights
  const { data: insightsData, isLoading: isLoadingInsights } = useQuery<{ insights: string }>({
    queryKey: ['ai-insights'],
    queryFn: () => apiRequest<{ insights: string }>('/ai/insights'),
    enabled: activeTab === 'insights'
  });

  // Fetch goal predictions
  const { data: predictionsData, isLoading: isLoadingPredictions } = useQuery<{ prediction: string }>({
    queryKey: ['ai-predictions'],
    queryFn: () => apiRequest<{ prediction: string }>('/ai/predict-goals'),
    enabled: activeTab === 'insights'
  });

  // Recommendations query
  const { data: recommendations = [], isLoading: isLoadingRecs } = useQuery<Array<{ title: string; author: string; totalPages: number; reason: string }>>({
    queryKey: ['ai-recommendations'],
    queryFn: () => apiRequest<Array<{ title: string; author: string; totalPages: number; reason: string }>>('/ai/recommendations'),
    enabled: activeTab === 'summaries'
  });

  // Mutations
  const generateSummaryMutation = useMutation({
    mutationFn: (data: { title: string; author: string; type: string }) => 
      apiRequest<{ summary: string }>('/ai/summarize', { method: 'POST', body: JSON.stringify(data) }),
    onMutate: () => {
      setIsLoadingSummary(true);
      setGeneratedSummary(null);
    },
    onSuccess: (data) => {
      setIsLoadingSummary(false);
      setGeneratedSummary(data.summary);
    },
    onError: () => setIsLoadingSummary(false)
  });

  const askQuestionMutation = useMutation({
    mutationFn: (data: { bookId: string; question: string }) => 
      apiRequest<{ answer: string }>('/ai/ask', { method: 'POST', body: JSON.stringify(data) }),
    onMutate: () => {
      setIsLoadingQA(true);
      setQaAnswer(null);
    },
    onSuccess: (data) => {
      setIsLoadingQA(false);
      setQaAnswer(data.answer);
    },
    onError: () => setIsLoadingQA(false)
  });

  const coachMutation = useMutation({
    mutationFn: (prompt: string) => 
      apiRequest<{ feedback: string }>('/ai/coach', { method: 'POST', body: JSON.stringify({ prompt }) }),
    onSuccess: (data) => {
      setChatHistory(prev => [...prev, { sender: 'coach', text: data.feedback }]);
      setIsLoadingCoach(false);
    },
    onError: () => setIsLoadingCoach(false)
  });

  const flashcardMutation = useMutation({
    mutationFn: (bookId: string) => 
      apiRequest<Flashcard[]>('/ai/flashcards', { method: 'POST', body: JSON.stringify({ bookId }) }),
    onMutate: () => {
      setIsLoadingFlashcards(true);
      setFlashcards([]);
      setCurrentCardIndex(0);
      setIsFlipped(false);
    },
    onSuccess: (data) => {
      setIsLoadingFlashcards(false);
      setFlashcards(data);
    },
    onError: () => setIsLoadingFlashcards(false)
  });

  const addRecommendationMutation = useMutation({
    mutationFn: (bookData: { title: string; author: string; totalPages: number }) => 
      apiRequest<Book>('/books', { 
        method: 'POST', 
        body: JSON.stringify({ ...bookData, status: 'want-to-read' }) 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      alert('Recommended book added to your "Want to Read" shelf!');
    }
  });

  const handleGenerateSummary = (e: React.FormEvent) => {
    e.preventDefault();
    const targetBook = books.find(b => b.id === selectedBookId);
    if (!targetBook) return;

    generateSummaryMutation.mutate({
      title: targetBook.title,
      author: targetBook.author,
      type: summaryType
    });
  };

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookId || !bookQuestion.trim()) return;
    askQuestionMutation.mutate({
      bookId: selectedBookId,
      question: bookQuestion.trim()
    });
  };

  const handleSendCoachMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coachInput.trim()) return;

    const userMsg = coachInput.trim();
    setChatHistory(prev => [...prev, { sender: 'user', text: userMsg }]);
    setCoachInput('');
    setIsLoadingCoach(true);

    coachMutation.mutate(userMsg);
  };

  const handleFetchFlashcards = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flashcardBookId) return;
    flashcardMutation.mutate(flashcardBookId);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto py-4 px-2 md:px-6">
      <header>
        <h2 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-brand-primary" />
          Vault AI Space
        </h2>
        <p className="text-xs text-text-secondary mt-0.5">Explore summaries, study card decks, goal completions, and chat coaches</p>
      </header>

      {/* Tabs Menu Navigation */}
      <div className="flex bg-bg-secondary p-1 rounded-md border border-border-neutral overflow-x-auto gap-1">
        {[
          { id: 'summaries', label: 'Summaries & Q&A', icon: FileText },
          { id: 'coach', label: 'Reading Coach', icon: MessageSquare },
          { id: 'flashcards', label: 'Recall Cards', icon: CreditCard },
          { id: 'insights', label: 'Insights & Goals', icon: Lightbulb },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'summaries' | 'coach' | 'flashcards' | 'insights')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded text-xs font-bold transition-all ${
                isActive ? 'bg-white/5 text-text-primary' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Active Tab Viewports */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* 1. Summaries & Q&A Tab */}
          {activeTab === 'summaries' && (
            <>
              {/* Left Column Controls */}
              <div className="flex flex-col gap-6 md:col-span-1">
                <section className="p-6 rounded-lg bg-bg-secondary border border-border-neutral flex flex-col gap-4">
                  <h3 className="text-xs uppercase tracking-wider font-bold text-text-secondary flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-brand-primary" />
                    AI Book Summarizer
                  </h3>
                  <form onSubmit={handleGenerateSummary} className="flex flex-col gap-4 text-xs font-semibold text-text-secondary">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-wider">Book</label>
                      <select 
                        value={selectedBookId}
                        onChange={(e) => { 
                          setSelectedBookId(e.target.value); 
                          setGeneratedSummary(null);
                          setQaAnswer(null);
                        }}
                        className="px-3 py-2.5 rounded bg-bg-secondary border border-border-neutral text-text-primary outline-none focus:border-brand-primary"
                      >
                        <option value="">-- Choose a Book --</option>
                        {books.map(b => (
                          <option key={b.id} value={b.id}>{b.title}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-wider">Template Type</label>
                      <select 
                        value={summaryType}
                        onChange={(e) => setSummaryType(e.target.value)}
                        className="px-3 py-2.5 rounded bg-bg-secondary border border-border-neutral text-text-primary outline-none focus:border-brand-primary"
                      >
                        <option value="takeaways">Key Takeaways</option>
                        <option value="digest">Chapter Digests</option>
                        <option value="outline">Structural Outline</option>
                      </select>
                    </div>

                    <button 
                      type="submit"
                      disabled={isLoadingSummary || !selectedBookId}
                      className="py-2.5 rounded bg-brand-primary text-text-inverse font-bold hover:bg-brand-primary-hover active:scale-97 disabled:opacity-50"
                    >
                      {isLoadingSummary ? 'Generating...' : 'Generate Summary'}
                    </button>
                  </form>
                </section>

                {/* Q&A trigger */}
                {selectedBookId && (
                  <section className="p-6 rounded-lg bg-bg-secondary border border-border-neutral flex flex-col gap-4">
                    <h3 className="text-xs uppercase tracking-wider font-bold text-text-secondary flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-brand-warning" />
                      Ask About Book
                    </h3>
                    <form onSubmit={handleAskQuestion} className="flex flex-col gap-3 text-xs font-semibold text-text-secondary">
                      <textarea
                        required
                        placeholder="What does the author say about focus environments?"
                        value={bookQuestion}
                        onChange={(e) => setBookQuestion(e.target.value)}
                        className="p-2.5 rounded bg-bg-secondary border border-border-neutral text-text-primary outline-none focus:border-brand-primary placeholder:text-text-tertiary min-h-[70px]"
                      />
                      <button 
                        type="submit"
                        disabled={isLoadingQA}
                        className="py-2 rounded bg-white/4 text-text-primary hover:bg-white/8 active:scale-97 font-bold border border-border-neutral"
                      >
                        {isLoadingQA ? 'Asking AI...' : 'Ask Question'}
                      </button>
                    </form>
                  </section>
                )}
              </div>

              {/* Right Column Results Display */}
              <div className="md:col-span-2 flex flex-col gap-6">
                <section className="p-6 rounded-lg bg-bg-secondary border border-border-neutral flex-1 min-h-[350px] flex flex-col">
                  <h3 className="text-xs uppercase tracking-wider font-bold text-text-secondary mb-4">Output Window</h3>
                  
                  {isLoadingSummary || isLoadingQA ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 text-center gap-3">
                      <div className="w-8 h-8 border-2 border-white/10 border-t-brand-primary rounded-full animate-spin"></div>
                      <p className="text-xs text-text-secondary">Generating intelligence response...</p>
                    </div>
                  ) : generatedSummary ? (
                    <div className="p-4 rounded-lg bg-bg-tertiary border border-border-neutral text-xs text-text-secondary whitespace-pre-line leading-relaxed scrollbar-thin overflow-y-auto max-h-[360px]">
                      {generatedSummary}
                    </div>
                  ) : qaAnswer ? (
                    <div className="flex flex-col gap-4">
                      <div className="p-3 bg-white/3 rounded border border-border-neutral">
                        <span className="text-[9px] uppercase tracking-wider font-bold text-text-tertiary">Question</span>
                        <p className="text-xs font-bold text-text-primary mt-1">&ldquo;{bookQuestion}&rdquo;</p>
                      </div>
                      <div className="p-4 rounded bg-bg-tertiary border border-border-neutral text-xs text-text-secondary whitespace-pre-line leading-relaxed">
                        {qaAnswer}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 text-text-tertiary py-20">
                      <Sparkles className="w-8 h-8 opacity-20" />
                      <p className="text-xs max-w-xs">Select a book and trigger summaries or ask questions to populate results.</p>
                    </div>
                  )}
                </section>

                {/* Recommendations grid */}
                <section className="p-6 rounded-lg bg-bg-secondary border border-border-neutral">
                  <h3 className="text-xs uppercase tracking-wider font-bold text-text-secondary mb-4 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-brand-warning" />
                    AI Recommended Reads
                  </h3>
                  {isLoadingRecs ? (
                    <div className="text-center py-6 text-xs text-text-tertiary">Analyzing history library...</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {recommendations.slice(0, 2).map((r, i) => (
                        <div key={i} className="p-3.5 rounded bg-bg-tertiary border border-border-neutral flex flex-col justify-between gap-3">
                          <div>
                            <h4 className="text-xs font-bold text-text-primary">{r.title}</h4>
                            <p className="text-[10px] text-text-secondary mt-0.5">by {r.author}</p>
                            <p className="text-[10px] text-text-tertiary mt-2">{r.reason}</p>
                          </div>
                          <button 
                            onClick={() => addRecommendationMutation.mutate({ title: r.title, author: r.author, totalPages: r.totalPages })}
                            className="w-full py-2 rounded bg-white/4 hover:bg-white/8 text-[9px] font-bold uppercase active:scale-97 text-text-primary"
                          >
                            Add to Want to Read
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </>
          )}

          {/* 2. Reading Coach Chatbot Tab */}
          {activeTab === 'coach' && (
            <section className="md:col-span-3 p-6 rounded-lg bg-bg-secondary border border-border-neutral flex flex-col h-[500px]">
              <div className="flex justify-between items-center pb-3 border-b border-border-neutral mb-4">
                <div>
                  <h3 className="text-xs uppercase tracking-wider font-bold text-text-primary flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-brand-success" />
                    Zen Coach Conversations
                  </h3>
                  <p className="text-[10px] text-text-secondary mt-0.5">Get motivation, habits adjustments, and reading guidance</p>
                </div>
              </div>

              {/* Message History Viewport */}
              <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4 scrollbar-thin mb-4">
                {chatHistory.map((m, i) => (
                  <div 
                    key={i} 
                    className={`flex flex-col max-w-[80%] p-3.5 rounded-lg text-xs leading-relaxed ${
                      m.sender === 'coach' 
                        ? 'bg-bg-tertiary border border-border-neutral self-start text-text-secondary' 
                        : 'bg-brand-primary text-text-inverse self-end font-semibold'
                    }`}
                  >
                    <span className="text-[8px] uppercase tracking-wider font-bold opacity-60 mb-1">
                      {m.sender === 'coach' ? 'Reading Coach' : 'You'}
                    </span>
                    <p className="whitespace-pre-line">{m.text}</p>
                  </div>
                ))}
                
                {isLoadingCoach && (
                  <div className="p-3 bg-bg-tertiary border border-border-neutral self-start rounded-lg text-xs flex items-center gap-2 text-text-tertiary">
                    <span className="w-1.5 h-1.5 bg-brand-success rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-brand-success rounded-full animate-bounce delay-100"></span>
                    <span className="w-1.5 h-1.5 bg-brand-success rounded-full animate-bounce delay-200"></span>
                    <span>Analyzing reading habits...</span>
                  </div>
                )}
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendCoachMessage} className="flex gap-2">
                <input 
                  type="text" 
                  required
                  placeholder="Ask the coach: 'How do I read when tired?' or 'Give me focus advice'"
                  value={coachInput}
                  onChange={(e) => setCoachInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded bg-bg-secondary border border-border-neutral text-xs outline-none text-text-primary focus:border-brand-primary"
                />
                <button 
                  type="submit"
                  disabled={isLoadingCoach}
                  className="w-10 h-10 rounded bg-brand-primary text-text-inverse flex items-center justify-center hover:bg-brand-primary-hover active:scale-95 shadow-md disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </section>
          )}

          {/* 3. Recall Flashcard Decks Tab */}
          {activeTab === 'flashcards' && (
            <>
              {/* Controls Left Column */}
              <div className="md:col-span-1 p-6 rounded-lg bg-bg-secondary border border-border-neutral flex flex-col gap-4">
                <h3 className="text-xs uppercase tracking-wider font-bold text-text-secondary flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-brand-primary" />
                  Study Cards Decks
                </h3>
                <p className="text-[10px] text-text-secondary leading-relaxed">
                  Generate active recall study decks based on notes, reviews, and highlights saved in your notebook library.
                </p>
                <form onSubmit={handleFetchFlashcards} className="flex flex-col gap-4 text-xs font-semibold text-text-secondary">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-wider">Select Book</label>
                    <select 
                      value={flashcardBookId}
                      onChange={(e) => setFlashcardBookId(e.target.value)}
                      className="px-3 py-2.5 rounded bg-bg-secondary border border-border-neutral text-text-primary outline-none focus:border-brand-primary"
                    >
                      <option value="">-- Select a Book --</option>
                      {books.map(b => (
                        <option key={b.id} value={b.id}>{b.title}</option>
                      ))}
                    </select>
                  </div>

                  <button 
                    type="submit"
                    disabled={isLoadingFlashcards || !flashcardBookId}
                    className="py-2.5 rounded bg-brand-primary text-text-inverse font-bold hover:bg-brand-primary-hover active:scale-97 disabled:opacity-50"
                  >
                    {isLoadingFlashcards ? 'Generating Cards...' : 'Generate Flashcards'}
                  </button>
                </form>
              </div>

              {/* Cards Carousel Viewport Right Column */}
              <div className="md:col-span-2 flex flex-col items-center justify-center p-6 rounded-lg bg-bg-secondary border border-border-neutral min-h-[300px]">
                {isLoadingFlashcards ? (
                  <div className="flex flex-col items-center gap-3 py-12 text-center text-text-secondary text-xs">
                    <div className="w-8 h-8 border-2 border-white/10 border-t-brand-primary rounded-full animate-spin"></div>
                    <p>Generating flashcards from notebook highlights...</p>
                  </div>
                ) : flashcards.length > 0 ? (
                  <div className="flex flex-col items-center gap-6 w-full max-w-sm">
                    {/* Active Flip Card Wrapper */}
                    <div 
                      onClick={() => setIsFlipped(!isFlipped)}
                      className="relative w-full aspect-[16/10] bg-bg-tertiary border border-border-neutral hover:border-border-neutral-hover rounded-xl shadow-2xl p-6 flex flex-col justify-center items-center text-center cursor-pointer transition-all active:scale-98 select-none"
                    >
                      <span className="absolute top-3 left-4 text-[8px] font-bold text-text-tertiary uppercase tracking-wider">
                        {isFlipped ? 'Answer View' : 'Question View'}
                      </span>
                      <span className="absolute top-3 right-4 text-[8px] font-bold text-text-tertiary">
                        Card {currentCardIndex + 1} of {flashcards.length}
                      </span>
                      
                      <p className="text-sm font-bold text-text-primary px-4 leading-relaxed">
                        {isFlipped ? flashcards[currentCardIndex].answer : flashcards[currentCardIndex].question}
                      </p>
                      
                      <span className="absolute bottom-3 text-[8px] text-brand-primary uppercase tracking-widest font-bold opacity-60">
                        Tap Card to Flip
                      </span>
                    </div>

                    {/* Carousel Navigators */}
                    <div className="flex items-center gap-6">
                      <button 
                        onClick={() => {
                          setCurrentCardIndex(prev => Math.max(0, prev - 1));
                          setIsFlipped(false);
                        }}
                        disabled={currentCardIndex === 0}
                        className="px-3.5 py-1.5 rounded bg-white/4 hover:bg-white/8 text-[10px] uppercase font-bold tracking-wider disabled:opacity-30 disabled:pointer-events-none text-text-primary"
                      >
                        ← Prev
                      </button>

                      <button 
                        onClick={() => {
                          setCurrentCardIndex(prev => Math.min(flashcards.length - 1, prev + 1));
                          setIsFlipped(false);
                        }}
                        disabled={currentCardIndex === flashcards.length - 1}
                        className="px-3.5 py-1.5 rounded bg-white/4 hover:bg-white/8 text-[10px] uppercase font-bold tracking-wider disabled:opacity-30 disabled:pointer-events-none text-text-primary"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center gap-3 text-text-tertiary py-12">
                    <CreditCard className="w-8 h-8 opacity-20" />
                    <p className="text-xs">Compile a study deck to test your active recall and retention.</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* 4. Reading Insights & Goal Predictions Tab */}
          {activeTab === 'insights' && (
            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Velocity Insights */}
              <section className="p-6 rounded-lg bg-bg-secondary border border-border-neutral min-h-[250px]">
                <h3 className="text-xs uppercase tracking-wider font-bold text-text-secondary mb-4 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-brand-success" />
                  Velocity Insights
                </h3>
                {isLoadingInsights ? (
                  <div className="flex flex-col justify-center items-center py-12 text-xs text-text-tertiary gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <p>Generating insights...</p>
                  </div>
                ) : insightsData?.insights ? (
                  <div className="p-4 rounded bg-bg-tertiary border border-border-neutral text-xs text-text-secondary leading-relaxed whitespace-pre-line prose prose-invert">
                    {insightsData.insights}
                  </div>
                ) : (
                  <p className="text-xs text-text-tertiary">No insights compiled. Log sessions first.</p>
                )}
              </section>

              {/* Goal completion predictions */}
              <section className="p-6 rounded-lg bg-bg-secondary border border-border-neutral min-h-[250px]">
                <h3 className="text-xs uppercase tracking-wider font-bold text-text-secondary mb-4 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
                  Goal Predictions
                </h3>
                {isLoadingPredictions ? (
                  <div className="flex flex-col justify-center items-center py-12 text-xs text-text-tertiary gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <p>Estimating yearly velocity targets...</p>
                  </div>
                ) : predictionsData?.prediction ? (
                  <div className="p-4 rounded bg-bg-tertiary border border-border-neutral text-xs text-text-secondary leading-relaxed whitespace-pre-line prose prose-invert">
                    {predictionsData.prediction}
                  </div>
                ) : (
                  <p className="text-xs text-text-tertiary">Predictions currently unavailable.</p>
                )}
              </section>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
