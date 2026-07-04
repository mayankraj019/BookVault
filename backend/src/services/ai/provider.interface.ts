export interface AIProvider {
  generateSummary(title: string, author: string, type: string): Promise<string>;
  generateRecommendations(history: string[]): Promise<Array<{ title: string; author: string; totalPages: number; reason: string }>>;
  generateInsights(stats: { totalPagesRead: number; totalDurationSeconds: number; totalSessions: number; currentStreak: number }): Promise<string>;
  predictGoalCompletion(stats: { totalPagesRead: number; completedCount: number }, goal: { yearlyTarget: number; monthlyPagesTarget: number }): Promise<string>;
  getCoachResponse(prompt: string, context: { streak: number; recentReadTitle?: string }): Promise<string>;
  naturalLanguageSearch(books: Array<{ id: string; title: string; author: string; status: string }>, query: string): Promise<string[]>; // Returns matched book IDs
  generateFlashcards(title: string, notes: string[]): Promise<Array<{ question: string; answer: string }>>;
  askAboutBook(title: string, question: string): Promise<string>;
}
