import { AIProvider } from './provider.interface';
import { GoogleGenAI } from '@google/genai';
import { logger } from '../../config/logger';

export class GeminiAIProvider implements AIProvider {
  private ai: any;
  private modelName = 'gemini-1.5-flash';

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
    if (!apiKey) {
      logger.warn('⚠️ GEMINI_API_KEY not configured. Gemini AI Provider will not function correctly.');
      return;
    }
    // Instantiate using new GoogleGenAI class from @google/generative-ai
    this.ai = new GoogleGenAI({ apiKey });
  }

  private isConfigured(): boolean {
    return !!this.ai;
  }

  async generateSummary(title: string, author: string, type: string): Promise<string> {
    if (!this.isConfigured()) throw new Error('Gemini API is not configured');

    const prompt = `Provide a structured markdown overview of the book "${title}" by ${author}. 
    Template requested: ${type === 'takeaways' ? '3 core actionable takeaways' : type === 'digest' ? 'brief digests of chapters/parts' : 'a structural outline of topics'}.
    Keep it concise, elegant, and format in clean markdown.`;

    try {
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
      });
      return response.text || 'Could not generate summary';
    } catch (err: any) {
      logger.error(`Gemini generateSummary Error: ${err.message}`);
      throw new Error(`Failed to generate summary via Gemini: ${err.message}`);
    }
  }

  async generateRecommendations(history: string[]): Promise<Array<{ title: string; author: string; totalPages: number; reason: string }>> {
    if (!this.isConfigured()) throw new Error('Gemini API is not configured');

    const prompt = `Based on these books that the user has read or wants to read: ${history.join(', ')}.
    Recommend 3 books they should read next. Return the recommendations strictly in a valid JSON array format, where each item has "title", "author", "totalPages" (a number), and "reason" (why they would like it). Do not return any other text, markdown wrapper, or formatting except JSON.`;

    try {
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
      });
      const cleanJson = this.sanitizeJsonString(response.text || '[]');
      return JSON.parse(cleanJson);
    } catch (err: any) {
      logger.error(`Gemini generateRecommendations Error: ${err.message}`);
      throw new Error('Failed to parse recommendations from Gemini');
    }
  }

  async generateInsights(stats: { totalPagesRead: number; totalDurationSeconds: number; totalSessions: number; currentStreak: number }): Promise<string> {
    if (!this.isConfigured()) throw new Error('Gemini API is not configured');

    const prompt = `Create 3 short, premium reading habit insights (in markdown bullet points) for a reader with the following reading history:
    - Total Pages Read: ${stats.totalPagesRead}
    - Total Reading Duration: ${Math.round(stats.totalDurationSeconds / 60)} minutes
    - Number of Sessions: ${stats.totalSessions}
    - Active Daily Streak: ${stats.currentStreak} days
    Provide constructive, motivational tips regarding their reading speed and habits.`;

    try {
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
      });
      return response.text || 'No insights available';
    } catch (err: any) {
      logger.error(`Gemini generateInsights Error: ${err.message}`);
      throw new Error(`Failed to generate insights: ${err.message}`);
    }
  }

  async predictGoalCompletion(stats: { totalPagesRead: number; completedCount: number }, goal: { yearlyTarget: number; monthlyPagesTarget: number }): Promise<string> {
    if (!this.isConfigured()) throw new Error('Gemini API is not configured');

    const prompt = `Predict if this reader will reach their yearly target based on these metrics:
    - User Completed Books Count: ${stats.completedCount} (Yearly Goal Target: ${goal.yearlyTarget} books)
    - Monthly Pages Goal Target: ${goal.monthlyPagesTarget} pages (User Total Pages Read: ${stats.totalPagesRead})
    - Days left in the year: ${Math.ceil((new Date(new Date().getFullYear(), 11, 31).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days.
    Provide a prediction in a short markdown paragraph outlining target pace and status.`;

    try {
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
      });
      return response.text || 'Goal prediction currently unavailable';
    } catch (err: any) {
      logger.error(`Gemini predictGoalCompletion Error: ${err.message}`);
      throw new Error('Goal prediction failed');
    }
  }

  async getCoachResponse(prompt: string, context: { streak: number; recentReadTitle?: string }): Promise<string> {
    if (!this.isConfigured()) throw new Error('Gemini API is not configured');

    const chatPrompt = `You are a warm, elegant personal reading coach. Give motivational advice to help the reader maintain their habit.
    User current active streak: ${context.streak} days.
    Recently read book title: ${context.recentReadTitle || 'None'}.
    User query: "${prompt}".
    Respond in 2-3 sentences.`;

    try {
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: chatPrompt,
      });
      return response.text || 'Keep reading, every page counts!';
    } catch (err: any) {
      logger.error(`Gemini getCoachResponse Error: ${err.message}`);
      return 'Keep reading, every page counts!';
    }
  }

  async naturalLanguageSearch(books: Array<{ id: string; title: string; author: string; status: string }>, query: string): Promise<string[]> {
    if (!this.isConfigured()) throw new Error('Gemini API is not configured');

    const prompt = `You are a search query router. Match this semantic request: "${query}" against the following user book library list:
    ${JSON.stringify(books)}
    Return strictly a JSON array of the matched "id" strings. Do not include markdown code block syntax, explanation or any other text.`;

    try {
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
      });
      const cleanJson = this.sanitizeJsonString(response.text || '[]');
      return JSON.parse(cleanJson);
    } catch (err: any) {
      logger.error(`Gemini naturalLanguageSearch Error: ${err.message}`);
      return []; // Return empty on failure
    }
  }

  async generateFlashcards(title: string, notes: string[]): Promise<Array<{ question: string; answer: string }>> {
    if (!this.isConfigured()) throw new Error('Gemini API is not configured');

    const prompt = `Using the following book notes/highlights for the book "${title}":
    ${notes.map((n, i) => `${i + 1}. ${n}`).join('\n')}
    Generate a JSON array of up to 4 study flashcards. Each card has "question" (an active recall question testing the concept) and "answer" (explaining it clearly). Return strictly valid JSON array. Do not return formatting or markdown wrapper syntax.`;

    try {
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
      });
      const cleanJson = this.sanitizeJsonString(response.text || '[]');
      return JSON.parse(cleanJson);
    } catch (err: any) {
      logger.error(`Gemini generateFlashcards Error: ${err.message}`);
      throw new Error('Failed to parse flashcards');
    }
  }

  async askAboutBook(title: string, question: string): Promise<string> {
    if (!this.isConfigured()) throw new Error('Gemini API is not configured');

    const prompt = `Regarding the book "${title}", answer the user's question: "${question}".
    Respond in a short, structured markdown format. Focus on key themes and insights.`;

    try {
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
      });
      return response.text || 'Could not answer the question';
    } catch (err: any) {
      logger.error(`Gemini askAboutBook Error: ${err.message}`);
      throw new Error('Ask about book failed');
    }
  }

  private sanitizeJsonString(raw: string): string {
    return raw
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();
  }
}
