import { AIProvider } from './provider.interface';
import { MockAIProvider } from './mock.provider';
import { GeminiAIProvider } from './gemini.provider';
import { logger } from '../../config/logger';

class AIService implements AIProvider {
  private activeProvider: AIProvider;

  constructor() {
    const providerConfig = process.env.AI_PROVIDER || 'mock';
    const hasGeminiKey = !!(process.env.GEMINI_API_KEY || process.env.API_KEY);

    if (providerConfig === 'gemini' && hasGeminiKey) {
      logger.info('🤖 AI Service initialized using Google Gemini Provider');
      this.activeProvider = new GeminiAIProvider();
    } else {
      logger.info('🤖 AI Service initialized using Mock Fallback Provider');
      this.activeProvider = new MockAIProvider();
    }
  }

  async generateSummary(title: string, author: string, type: string): Promise<string> {
    return this.activeProvider.generateSummary(title, author, type);
  }

  async generateRecommendations(history: string[]): Promise<Array<{ title: string; author: string; totalPages: number; reason: string }>> {
    return this.activeProvider.generateRecommendations(history);
  }

  async generateInsights(stats: { totalPagesRead: number; totalDurationSeconds: number; totalSessions: number; currentStreak: number }): Promise<string> {
    return this.activeProvider.generateInsights(stats);
  }

  async predictGoalCompletion(stats: { totalPagesRead: number; completedCount: number }, goal: { yearlyTarget: number; monthlyPagesTarget: number }): Promise<string> {
    return this.activeProvider.predictGoalCompletion(stats, goal);
  }

  async getCoachResponse(prompt: string, context: { streak: number; recentReadTitle?: string }): Promise<string> {
    return this.activeProvider.getCoachResponse(prompt, context);
  }

  async naturalLanguageSearch(books: Array<{ id: string; title: string; author: string; status: string }>, query: string): Promise<string[]> {
    return this.activeProvider.naturalLanguageSearch(books, query);
  }

  async generateFlashcards(title: string, notes: string[]): Promise<Array<{ question: string; answer: string }>> {
    return this.activeProvider.generateFlashcards(title, notes);
  }

  async askAboutBook(title: string, question: string): Promise<string> {
    return this.activeProvider.askAboutBook(title, question);
  }
}

export const aiService = new AIService();
export type { AIProvider };
