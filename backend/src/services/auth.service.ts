import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/user.repository';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/token';
import { BadRequestError, ConflictError, UnauthorizedError } from '../utils/errors';
import { logger } from '../config/logger';
import { EmailService } from './email.service';

const userRepository = new UserRepository();
const emailService = new EmailService();

/** Generate a random 6-digit numeric OTP */
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export class AuthService {
  async register(email: string, password: string) {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await userRepository.create({
      email,
      passwordHash,
      verificationToken: otp,
      verificationExpires,
    });

    // Send OTP to user's email
    await emailService.sendVerificationEmail(email, otp);

    return {
      id: user.id,
      email: user.email,
      isVerified: user.isVerified,
    };
  }

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isVerified) {
      throw new UnauthorizedError('Please verify your email before logging in');
    }

    const payload = { userId: user.id, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await userRepository.update(user.id, { refreshToken });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  async refresh(token: string) {
    try {
      const decoded = verifyRefreshToken(token);
      const user = await userRepository.findById(decoded.userId);

      if (!user || user.refreshToken !== token) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      const payload = { userId: user.id, role: user.role };
      const accessToken = generateAccessToken(payload);

      return { accessToken };
    } catch {
      throw new UnauthorizedError('Invalid refresh token');
    }
  }

  async verifyEmail(email: string, otp: string) {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new BadRequestError('No account found with this email');
    }

    if (user.isVerified) {
      return { message: 'Email is already verified' };
    }

    if (user.verificationToken !== otp) {
      throw new BadRequestError('Invalid verification code');
    }

    if (!user.verificationExpires || user.verificationExpires < new Date()) {
      throw new BadRequestError('Verification code has expired. Please request a new one.');
    }

    await userRepository.update(user.id, {
      isVerified: true,
      verificationToken: null,
      verificationExpires: null,
    });

    return { message: 'Email verified successfully' };
  }

  async resendVerificationOTP(email: string) {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      return { message: 'If that account exists, a new code has been sent' };
    }

    if (user.isVerified) {
      throw new BadRequestError('This email is already verified');
    }

    const otp = generateOTP();
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000);

    await userRepository.update(user.id, { verificationToken: otp, verificationExpires });
    await emailService.sendVerificationEmail(email, otp);

    return { message: 'A new verification code has been sent to your email' };
  }

  async forgotPassword(email: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      logger.warn(`Password reset requested for unregistered email: ${email}`);
      return { message: 'If that account exists, a reset code has been sent' };
    }

    const otp = generateOTP();
    const resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

    await userRepository.update(user.id, {
      resetPasswordToken: otp,
      resetPasswordExpires,
    });

    await emailService.sendPasswordResetEmail(email, otp);

    return { message: 'If that account exists, a reset code has been sent' };
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new BadRequestError('No account found with this email');
    }

    if (user.resetPasswordToken !== otp) {
      throw new BadRequestError('Invalid reset code');
    }

    if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      throw new BadRequestError('Reset code has expired. Please request a new one.');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await userRepository.update(user.id, {
      passwordHash,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    return { message: 'Password reset successful' };
  }
}
