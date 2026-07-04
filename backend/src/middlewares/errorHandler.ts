import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../config/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    logger.warn(`API Error: [${req.method}] ${req.originalUrl} - Status: ${err.statusCode} - Message: ${err.message}`);
    return res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
  }

  // Unhandled system errors
  logger.error(`Critical Server Error: [${req.method}] ${req.originalUrl} - Error: ${err.message} \nStack: ${err.stack}`);
  
  return res.status(500).json({
    success: false,
    error: 'Internal Server Error'
  });
};
