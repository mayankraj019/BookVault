import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters long')
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
  })
});

export const verifyEmailSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    otp: z.string().length(6, 'Verification code must be 6 digits').regex(/^\d{6}$/, 'Verification code must be numeric')
  })
});

export const resendOTPSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address')
  })
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address')
  })
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    otp: z.string().length(6, 'Reset code must be 6 digits').regex(/^\d{6}$/, 'Reset code must be numeric'),
    password: z.string().min(8, 'New password must be at least 8 characters long')
  })
});

export const bookCreateSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    author: z.string().min(1, 'Author is required'),
    totalPages: z.number().int().positive('Total pages must be a positive integer'),
    currentPage: z.number().int().nonnegative('Current page must be non-negative').optional(),
    coverUrl: z.string().url('Invalid cover image URL').optional().or(z.literal('')),
    status: z.enum(['currently-reading', 'completed', 'want-to-read', 'owned']).optional(),
    collectionIds: z.array(z.string().uuid()).optional()
  })
});

export const bookUpdateSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    author: z.string().min(1).optional(),
    totalPages: z.number().int().positive().optional(),
    currentPage: z.number().int().nonnegative().optional(),
    coverUrl: z.string().url().optional().or(z.literal('')),
    status: z.enum(['currently-reading', 'completed', 'want-to-read', 'owned']).optional(),
    rating: z.number().int().min(0).max(5).optional(),
    review: z.string().optional(),
    collectionIds: z.array(z.string()).optional()
  })
});

export const sessionCreateSchema = z.object({
  body: z.object({
    bookId: z.string().uuid('Invalid book ID format'),
    durationSeconds: z.number().int().positive('Duration must be a positive integer'),
    pagesRead: z.number().int().positive('Pages read must be a positive integer')
  })
});

export const collectionCreateSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Collection name is required').max(100)
  })
});
