import { AIProvider } from './provider.interface';

export class MockAIProvider implements AIProvider {
  async generateSummary(title: string, author: string, type: string): Promise<string> {
    if (type === 'takeaways') {
      return `### Core Takeaways: ${title} by ${author}\n\n1. **Systems > Goals**: Small incremental habits are the bedrock of behavioral transformations.\n2. **Compound Interest of Self-Improvement**: Improving by 1% each day yields a 37x improvement after one year.\n3. **Identity Shift**: True habit change is identity change. Focus on who you wish to *become* rather than what you want to achieve.`;
    } else if (type === 'digest') {
      return `### Chapter Digests: ${title}\n\n* **Part 1: The First Law (Make it Obvious)**: Design cues and triggers in your immediate reading space.\n* **Part 2: The Second Law (Make it Attractive)**: Pair habits you *need* to do with habits you *want* to do.\n* **Part 3: The Third Law (Make it Easy)**: Optimize friction and use the 2-minute rule.\n* **Part 4: The Fourth Law (Make it Satisfying)**: Log immediate reward metrics.`;
    } else {
      return `### Structural Outline: ${title}\n\n* **I. Foundations**: Why small changes make a big difference.\n* **II. The 4 Laws of Behavior Change**: Obvious, Attractive, Easy, and Satisfying.\n* **III. Advanced Tactics**: How to go from being merely good to truly great.`;
    }
  }

  async generateRecommendations(history: string[]): Promise<Array<{ title: string; author: string; totalPages: number; reason: string }>> {
    return [
      {
        title: 'Deep Work',
        author: 'Cal Newport',
        totalPages: 304,
        reason: 'Recommended because you enjoy focus timers and reading habit optimization guides.'
      },
      {
        title: 'The Power of Habit',
        author: 'Charles Duhigg',
        totalPages: 371,
        reason: 'Highly aligned with your search logs on cognitive psychology and habit loops.'
      },
      {
        title: 'Focus',
        author: 'Daniel Goleman',
        totalPages: 320,
        reason: 'Perfect follow-up for readers looking to train attention spans during focus timer intervals.'
      }
    ];
  }

  async generateInsights(stats: { totalPagesRead: number; totalDurationSeconds: number; totalSessions: number; currentStreak: number }): Promise<string> {
    const mins = stats.totalDurationSeconds / 60;
    const speed = mins > 0 ? (stats.totalPagesRead / mins).toFixed(1) : '0.0';
    return `### Reading Dashboard Insights\n\n* **Velocity**: You read at an average speed of **${speed} pages per minute**. This is a steady, mindful pace suited for comprehension.\n* **Habit Streaks**: Your current active streak is **${stats.currentStreak} days**. Consistently reading at similar times of day reinforces long-term retention.\n* **Consistency Profile**: You achieve your highest reading sessions when reading for 15-20 minutes, preventing cognitive fatigue.`;
  }

  async predictGoalCompletion(stats: { totalPagesRead: number; completedCount: number }, goal: { yearlyTarget: number; monthlyPagesTarget: number }): Promise<string> {
    const remainingBooks = Math.max(0, goal.yearlyTarget - stats.completedCount);
    if (remainingBooks === 0) {
      return `🎉 **Goal Achieved!** You have met or exceeded your yearly target of ${goal.yearlyTarget} books. Keep logging!`;
    }
    const daysRemainingInYear = Math.ceil((new Date(new Date().getFullYear(), 11, 31).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    // Estimate pace needed
    const pagesNeeded = remainingBooks * 250; // estimate 250 pages per book
    const dailyPagesTarget = (pagesNeeded / Math.max(1, daysRemainingInYear)).toFixed(1);

    return `### Yearly Goal Prediction\n\n* **Target Remaining**: **${remainingBooks} books** to finish before the end of the year.\n* **Pace Analysis**: To reach your goal, you need to read approximately **${dailyPagesTarget} pages per day** for the remaining ${daysRemainingInYear} days.\n* **Prediction**: Based on your historical velocity, you are **on track** to complete your goal! Maintain your streak to secure the finish.`;
  }

  async getCoachResponse(prompt: string, context: { streak: number; recentReadTitle?: string }): Promise<string> {
    const lower = prompt.toLowerCase();
    let response = `Hey there! Keep up the reading habit. Your current streak is **${context.streak} days**! `;

    if (lower.includes('focus') || lower.includes('timer')) {
      response += `To maximize focus, try leaving your phone in another room and starting a 15-minute stopwatch timer. Set small targets to build immediate momentum.`;
    } else if (lower.includes('lazy') || lower.includes('tired') || lower.includes('motivation')) {
      response += `It is completely normal to feel tired. The 2-minute rule says: just read one page. Often, once you start, momentum carries you forward.`;
    } else {
      response += `Every page you read is a vote for the identity of a lifelong reader. What insights are you capturing from **${context.recentReadTitle || 'your current book'}** today?`;
    }
    return response;
  }

  async naturalLanguageSearch(books: Array<{ id: string; title: string; author: string; status: string }>, query: string): Promise<string[]> {
    const lowerQuery = query.toLowerCase();
    
    // Semantic queries mock mapping
    if (lowerQuery.includes('habit') || lowerQuery.includes('behavior') || lowerQuery.includes('routine')) {
      return books
        .filter(b => b.title.toLowerCase().includes('habit') || b.title.toLowerCase().includes('programmer') || b.author.toLowerCase().includes('clear'))
        .map(b => b.id);
    }
    
    if (lowerQuery.includes('work') || lowerQuery.includes('focus') || lowerQuery.includes('productivity')) {
      return books
        .filter(b => b.title.toLowerCase().includes('deep') || b.title.toLowerCase().includes('habits') || b.author.toLowerCase().includes('newport'))
        .map(b => b.id);
    }

    // Default to basic string matching
    return books
      .filter(b => b.title.toLowerCase().includes(lowerQuery) || b.author.toLowerCase().includes(lowerQuery))
      .map(b => b.id);
  }

  async generateFlashcards(title: string, notes: string[]): Promise<Array<{ question: string; answer: string }>> {
    if (notes.length === 0) {
      return [
        {
          question: `What is the core principle of behavior change described in ${title}?`,
          answer: "Build identity-based habits by focusing on systems and small 1% compound improvements each day."
        },
        {
          question: `What are the 4 Laws of Behavior Change in ${title}?`,
          answer: "1. Make it obvious. 2. Make it attractive. 3. Make it easy. 4. Make it satisfying."
        }
      ];
    }

    // Convert notes into simple QA flashcards
    return notes.slice(0, 3).map((note, index) => ({
      question: `Recall Card #${index + 1} from your highlights of ${title}:`,
      answer: `"${note}" - Reflect on how this concept applies to your daily workflows and retention.`
    }));
  }

  async askAboutBook(title: string, question: string): Promise<string> {
    return `Regarding your question "*${question}*" about the book **${title}**:\n\nThe text emphasizes that habits are formed through context, triggers, and rewards. When we design environments to clear obstacles, we optimize focus automatically. Try applying this core concept to your reading habits today!`;
  }
}
