# 📚 BookVault

An intelligent, AI-powered reading tracker and study companion designed to help readers manage their library, analyze their habits, and engage deeper with their books through modern generative AI.

---

## 🚀 Key Features

### 1. Core Reading Tracker
* **Library Management:** Add, update, and search books in your catalog. Mark status as *Currently Reading*, *Completed*, *Want to Read*, or *Owned*.
* **Custom Shelves (Collections):** Organize your library into custom shelves (e.g., "Self Growth", "Tech", "History") to group related readings.
* **Granular Progress:** Track reading progress by updating current pages against total pages.
* **Notes & Highlights:** Write detailed book reviews or capture key highlighted quotes with specific page number associations.
* **Focus Mode:** A built-in clean, distraction-free reading timer to log real-time sessions.

### 2. Deep Analytics & Streaks
* **Reading Logs:** Chronological record of all reading sessions, tracking time spent and pages read.
* **Streak Calculator:** Keep track of daily consecutive reading streaks and total pages read to build strong habits.
* **Aesthetic Dashboard:** Clean, animated visualizations of your velocity, statistics, and monthly progress.

### 3. Intelligent AI Features (Powered by Google Gemini 1.5 Flash)
* **Summarization Suite:** Instantly generate outline digests, bulleted takeaways, or quick summaries for any book.
* **Active Recall Flashcards:** Auto-generate interactive Q&A flashcards using your custom notes and highlights.
* **Habit Insights:** Get personalized AI analysis of your reading speed and habits.
* **Conversational Reading Coach:** Ask a dedicated AI coach for focus strategies, motivation, or guidance.
* **Smart Semantic Search:** Ask the AI to find books semantically (e.g., "show me books on focus or habits") instead of searching for exact keywords.
* **Book-Specific Q&A:** Chat directly with the AI about specific book themes and plotlines.

---

## 🛠️ Tech Stack

BookVault is built with a decoupled client-server architecture using modern technologies:

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Next.js (App Router), Tailwind CSS v4, Framer Motion, Zustand, Radix UI, TanStack Query |
| **Backend** | Node.js, Express, TypeScript, Prisma ORM, Nodemailer, Winston Logger, Zod validation |
| **Database** | PostgreSQL |
| **AI Engine** | Google Gemini API (via `@google/genai` SDK) |

---

## 🏗️ Architecture

```mermaid
graph TD
    A[Next.js Frontend] -->|REST API Requests| B[Express Backend]
    B -->|Prisma Client| C[(PostgreSQL Database)]
    B -->|Google GenAI SDK| D[Google Gemini API]
    B -->|Nodemailer| E[SMTP Email Server]
```

---

## ⚙️ Project Structure

```
BookVault/
├── backend/               # Express + Prisma + PostgreSQL server
│   ├── prisma/            # Database schema & migrations
│   ├── src/               # Controllers, middleware, routes, services
│   └── API_DOCUMENTATION.md
├── src/                   # Next.js App router and views
│   ├── app/               # Main layout and pages
│   ├── components/        # Shared UI components
│   ├── store/             # Zustand state management
│   ├── views/             # Custom views (Dashboard, Library, AISpace, FocusMode, etc.)
│   └── providers/         # QueryProvider, etc.
└── public/                # Static assets
```

---

## 🚀 Setup & Installation

### Prerequisites
* Node.js (v18+ recommended)
* PostgreSQL Database running locally or hosted
* Google Gemini API Key (Optional; defaults to a Mock provider if not configured)

---

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file in the `backend` directory based on the `.env.example` file:
   ```env
   PORT=5001
   DATABASE_URL="postgresql://username:password@localhost:5432/bookvault?schema=public"
   JWT_SECRET="your_jwt_access_secret_here"
   JWT_REFRESH_SECRET="your_jwt_refresh_secret_here"
   
   # AI Provider Configuration
   AI_PROVIDER="gemini" # Set to "gemini" to enable Google Gemini AI features
   GEMINI_API_KEY="your_google_gemini_api_key_here"

   # SMTP Configurations (Optional for email registration verify/reset)
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT=587
   SMTP_USER="your_email@gmail.com"
   SMTP_PASS="your_app_password"
   FROM_EMAIL="noreply@bookvault.com"
   
   FRONTEND_URL="http://localhost:3000"
   ```
4. Run migrations to initialize the database:
   ```bash
   npm run prisma:migrate
   ```
5. Generate Prisma Client:
   ```bash
   npm run prisma:generate
   ```
6. Start the backend server in development mode:
   ```bash
   npm run dev
   ```
   *The server should run on `http://localhost:5001`.*

---

### 2. Frontend Setup

1. Navigate back to the root workspace directory:
   ```bash
   cd ..
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Run the Next.js development server:
   ```bash
   npm run dev
   ```
   *Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.*

---

## 📑 API Reference

The backend exposes a secure REST API for all data requirements. For detailed examples, request payloads, and response structures, see the [API Documentation](./backend/API_DOCUMENTATION.md).

Quick summary of endpoint prefixes:
* `/api/auth`: Register, login, token refresh, and email verification.
* `/api/books`: Add, update, delete, view books, and manage reading notes/highlights.
* `/api/sessions`: Log reading sessions, fetch analytics, and check streak records.
* `/api/collections`: Create, delete, and list custom shelves/collections.
* `/api/ai`: Generate book summaries, insights, flashcards, semantic search, and chat Q&A.
