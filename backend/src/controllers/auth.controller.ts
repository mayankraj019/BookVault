import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.register(email, password);
      return res.status(201).json({
        success: true,
        data: result,
        message: 'Account created! Check your email for a 6-digit verification code.',
      });
    } catch (err) {
      return next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      // Store refresh token in secure HTTP-only cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.status(200).json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (err) {
      return next(err);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
      if (!refreshToken) {
        return res.status(400).json({ success: false, error: 'Refresh token is required' });
      }

      const result = await authService.refresh(refreshToken);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      return next(err);
    }
  }

  /** POST /api/auth/verify-email  body: { email, otp } */
  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp } = req.body;
      const result = await authService.verifyEmail(email, otp);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      return next(err);
    }
  }

  /** POST /api/auth/resend-otp  body: { email } */
  async resendOTP(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const result = await authService.resendVerificationOTP(email);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      return next(err);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const result = await authService.forgotPassword(email);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      return next(err);
    }
  }

  /** POST /api/auth/reset-password  body: { email, otp, password } */
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp, password } = req.body;
      const result = await authService.resetPassword(email, otp, password);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      return next(err);
    }
  }
}
