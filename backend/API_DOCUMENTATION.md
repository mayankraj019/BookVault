# BookVault API Documentation

This document describes all REST API endpoints implemented in the BookVault backend service. All endpoints expect and return JSON payloads.

---

## Base URL
Default Local Development: `http://localhost:5000`

---

## 1. Authentication Endpoints (`/api/auth`)

### Register Account
- **Endpoint**: `POST /api/auth/register`
- **Access**: Public
- **Description**: Registers a new user. Generates an email verification token logged to the server terminal.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "strongpassword123"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "isVerified": false
    }
  }
  ```

---

### Verify Email
- **Endpoint**: `GET /api/auth/verify-email`
- **Access**: Public
- **Description**: Verifies a user's email using the registration token.
- **Query Parameters**:
  - `token` (String, Required)
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "message": "Email verified successfully"
    }
  }
  ```

---

### Login Account
- **Endpoint**: `POST /api/auth/login`
- **Access**: Public
- **Description**: Logs in a verified user, sets an HTTP-only Cookie `refreshToken`, and returns a short-lived JSON Web Token `accessToken`.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "strongpassword123"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "email": "user@example.com",
        "role": "USER"
      },
      "accessToken": "eyJhbGciOiJIUzI1NiIsIn..."
    }
  }
  ```

---

### Refresh Access Token
- **Endpoint**: `POST /api/auth/refresh`
- **Access**: Public
- **Description**: Refreshes an expired access token using the refresh token stored in cookie or body.
- **Request Body** (Alternative to HTTP-only cookie):
  ```json
  {
    "refreshToken": "eyJhbGciOiJIUzI1NiIsIn..."
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsIn..."
    }
  }
  ```

---

### Forgot Password
- **Endpoint**: `POST /api/auth/forgot-password`
- **Access**: Public
- **Description**: Requests a password reset token. Logs the reset link to the server console.
- **Request Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "message": "Password reset link sent if email exists"
    }
  }
  ```

---

### Reset Password
- **Endpoint**: `POST /api/auth/reset-password`
- **Access**: Public
- **Description**: Resets a user's password using the token received.
- **Request Body**:
  ```json
  {
    "token": "reset_token_received",
    "password": "newstrongpassword123"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "message": "Password reset successful"
    }
  }
  ```

---

## 2. Books Catalog Endpoints (`/api/books`)

*Authentication Required: Bearer JWT in the `Authorization` header.*

### Get Books Catalog
- **Endpoint**: `GET /api/books`
- **Access**: Private (Authenticated)
- **Description**: Retrieves list of books owned by the logged-in user. Supports search and status filters.
- **Query Parameters**:
  - `status` (String: 'currently-reading' | 'completed' | 'want-to-read' | 'owned' | 'all')
  - `search` (String: title or author query match)
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "220f8400-e29b-41d4-a716-446655440111",
        "userId": "550e8400-e29b-41d4-a716-446655440000",
        "title": "Atomic Habits",
        "author": "James Clear",
        "totalPages": 320,
        "currentPage": 120,
        "status": "currently-reading",
        "rating": 4,
        "review": "Excellent actionable guidelines."
      }
    ]
  }
  ```

---

### Get Book Details
- **Endpoint**: `GET /api/books/:id`
- **Access**: Private (Authenticated, Owner check)
- **Description**: Retrieves detailed information for a specific book including collection tag IDs, notes, and highlights.
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "220f8400-e29b-41d4-a716-446655440111",
      "title": "Atomic Habits",
      "author": "James Clear",
      "totalPages": 320,
      "currentPage": 120,
      "status": "currently-reading",
      "rating": 4,
      "review": "Excellent actionable guidelines.",
      "collections": [
        { "collectionId": "990f8400-e29b-41d4-a716-446655440999" }
      ],
      "notesHighlights": [
        {
          "id": "note-id-123",
          "type": "note",
          "content": "Make habits obvious, attractive, easy, and satisfying.",
          "pageNumber": 54
        }
      ]
    }
  }
  ```

---

### Add Book
- **Endpoint**: `POST /api/books`
- **Access**: Private (Authenticated)
- **Description**: Add a new book to the user's library.
- **Request Body**:
  ```json
  {
    "title": "Pragmatic Programmer",
    "author": "Andy Hunt",
    "totalPages": 350,
    "currentPage": 0,
    "status": "want-to-read",
    "collectionIds": ["990f8400-e29b-41d4-a716-446655440999"]
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "440f8400-e29b-41d4-a716-446655440444",
      "title": "Pragmatic Programmer",
      "author": "Andy Hunt",
      "totalPages": 350,
      "currentPage": 0,
      "status": "want-to-read"
    }
  }
  ```

---

### Update Book Progress / Metadata
- **Endpoint**: `PUT /api/books/:id`
- **Access**: Private (Authenticated, Owner check)
- **Description**: Updates book details. Validates that `currentPage` does not exceed `totalPages`.
- **Request Body**:
  ```json
  {
    "currentPage": 45,
    "status": "currently-reading",
    "rating": 5
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "440f8400-e29b-41d4-a716-446655440444",
      "title": "Pragmatic Programmer",
      "currentPage": 45,
      "status": "currently-reading"
    }
  }
  ```

---

### Delete Book
- **Endpoint**: `DELETE /api/books/:id`
- **Access**: Private (Authenticated, Owner check)
- **Description**: Removes a book records along with cascading notes and highlights.
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Book deleted successfully"
  }
  ```

---

### Add Note/Highlight
- **Endpoint**: `POST /api/books/:bookId/notes`
- **Access**: Private (Authenticated, Owner check)
- **Description**: Saves a review note or highlighted quote.
- **Request Body**:
  ```json
  {
    "type": "highlight",
    "content": "Care about your craft.",
    "pageNumber": 12
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "note-id-456",
      "bookId": "440f8400-e29b-41d4-a716-446655440444",
      "type": "highlight",
      "content": "Care about your craft.",
      "pageNumber": 12
    }
  }
  ```

---

### Remove Note/Highlight
- **Endpoint**: `DELETE /api/books/:bookId/notes/:id`
- **Access**: Private (Authenticated, Owner check)
- **Description**: Deletes a specific note/highlight record.
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Note/Highlight removed successfully"
  }
  ```

---

## 3. Reading Sessions Endpoints (`/api/sessions`)

*Authentication Required: Bearer JWT in the `Authorization` header.*

### Fetch Session History
- **Endpoint**: `GET /api/sessions`
- **Access**: Private (Authenticated)
- **Description**: Returns all logged reading sessions with parent book info.
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "session-id-123",
        "bookId": "220f8400-e29b-41d4-a716-446655440111",
        "durationSeconds": 1800,
        "pagesRead": 15,
        "timestamp": "2026-06-30T10:00:00Z",
        "book": {
          "title": "Atomic Habits",
          "author": "James Clear"
        }
      }
    ]
  }
  ```

---

### Log Reading Session
- **Endpoint**: `POST /api/sessions`
- **Access**: Public (Authenticated)
- **Description**: Logs a finished reading session. Automatically updates the parent book's `currentPage` count.
- **Request Body**:
  ```json
  {
    "bookId": "220f8400-e29b-41d4-a716-446655440111",
    "durationSeconds": 1800,
    "pagesRead": 15
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "session-id-123",
      "bookId": "220f8400-e29b-41d4-a716-446655440111",
      "durationSeconds": 1800,
      "pagesRead": 15,
      "timestamp": "2026-06-30T10:00:00Z"
    }
  }
  ```

---

### Fetch Dashboard Streak & Metrics
- **Endpoint**: `GET /api/sessions/analytics`
- **Access**: Private (Authenticated)
- **Description**: Calculates cumulative stats (total pages, total sessions) and returns current active reading streak consecutive days.
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "totalPagesRead": 135,
      "totalDurationSeconds": 7200,
      "totalSessions": 4,
      "currentStreak": 3,
      "history": ["2026-06-30", "2026-06-29", "2026-06-28"]
    }
  }
  ```

---

## 4. Collections / Shelves Endpoints (`/api/collections`)

*Authentication Required: Bearer JWT in the `Authorization` header.*

### Fetch Collections Shelf List
- **Endpoint**: `GET /api/collections`
- **Access**: Private (Authenticated)
- **Description**: Retrieves user's shelves with count of books inside.
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "990f8400-e29b-41d4-a716-446655440999",
        "name": "Self Growth",
        "_count": { "books": 3 }
      }
    ]
  }
  ```

---

### Add Custom Collection (Shelf)
- **Endpoint**: `POST /api/collections`
- **Access**: Private (Authenticated)
- **Description**: Create a new custom collection shelf.
- **Request Body**:
  ```json
  {
    "name": "Programming"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "col-uuid-789",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Programming"
    }
  }
  ```

---

### Delete Custom Collection
- **Endpoint**: `DELETE /api/collections/:id`
- **Access**: Private (Authenticated, Owner check)
- **Description**: Deletes a shelf category. Book profiles remain in catalog shelves.
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Collection deleted successfully"
  }
  ```

---

## 5. Intelligent AI Endpoints (`/api/ai`)

*Authentication Required: Bearer JWT in the `Authorization` header.*

### Generate Book Summary
- **Endpoint**: `POST /api/ai/summarize`
- **Access**: Private (Authenticated)
- **Description**: Returns outline digests and takeaways templates.
- **Request Body**:
  ```json
  {
    "title": "Atomic Habits",
    "author": "James Clear",
    "type": "takeaways" // 'takeaways' | 'digest' | 'outline'
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "summary": "### Core Takeaways...\n\n1. Systems > Goals..."
    }
  }
  ```

---

### Get Recommendations
- **Endpoint**: `POST /api/ai/recommendations`
- **Access**: Private (Authenticated)
- **Description**: Provides personalized recommendations based on library history.
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "title": "Deep Work",
        "author": "Cal Newport",
        "totalPages": 304,
        "reason": "Aligned with your focus timer habits."
      }
    ]
  }
  ```

---

### Get Habit Insights
- **Endpoint**: `POST /api/ai/insights`
- **Access**: Private (Authenticated)
- **Description**: Generates markdown bullet observations on speed metrics and streaks.
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "insights": "### Reading Dashboard Insights\n\n* **Velocity**..."
    }
  }
  ```

---

### Predict Goal Completion
- **Endpoint**: `POST /api/ai/predict-goals`
- **Access**: Private (Authenticated)
- **Description**: Assesses daily targets needed to reach books/pages goals.
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "prediction": "### Yearly Goal Prediction\n\n* **Target Remaining**..."
    }
  }
  ```

---

### Ask Reading Coach
- **Endpoint**: `POST /api/ai/coach`
- **Access**: Private (Authenticated)
- **Description**: Conversational chatbot prompt responding to motivational/focus queries.
- **Request Body**:
  ```json
  {
    "prompt": "How do I maintain reading when feeling tired?"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "feedback": "It is completely normal to feel tired. Try the 2-minute rule..."
    }
  }
  ```

---

### Natural Language Search
- **Endpoint**: `POST /api/ai/search`
- **Access**: Private (Authenticated)
- **Description**: Semantically searches the catalog and returns matched book IDs.
- **Request Body**:
  ```json
  {
    "query": "suggest books about business habits"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": ["220f8400-e29b-41d4-a716-446655440111"]
  }
  ```

---

### Generate Flashcards
- **Endpoint**: `POST /api/ai/flashcards`
- **Access**: Private (Authenticated)
- **Description**: Renders active recall study cards based on book notebook notes.
- **Request Body**:
  ```json
  {
    "bookId": "220f8400-e29b-41d4-a716-446655440111"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "question": "What is the core principle of behavior change?",
        "answer": "Build identity-based habits."
      }
    ]
  }
  ```

---

### Ask Book Specific Question
- **Endpoint**: `POST /api/ai/ask`
- **Access**: Private (Authenticated)
- **Description**: Chat Q&A regarding a specific book's themes.
- **Request Body**:
  ```json
  {
    "bookId": "220f8400-e29b-41d4-a716-446655440111",
    "question": "What does the author say about environment triggers?"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "answer": "Regarding your question... Environment design reduces friction..."
    }
  }
  ```

