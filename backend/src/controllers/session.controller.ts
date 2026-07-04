import { Response, NextFunction } from 'express';
import { SessionService } from '../services/session.service';
import { AuthenticatedRequest } from '../middlewares/auth';

const sessionService = new SessionService();

export class SessionController {
  async getSessions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await sessionService.getSessions(userId);
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      return next(err);
    }
  }

  async createSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await sessionService.createSession(userId, req.body);
      return res.status(201).json({
        success: true,
        data: result
      });
    } catch (err) {
      return next(err);
    }
  }

  async getAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await sessionService.getDashboardAnalytics(userId);
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      return next(err);
    }
  }
}
