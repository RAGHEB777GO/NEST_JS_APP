import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Otp } from './otp.schema';
import { EmailService } from './email.service';
import { TokenService } from './token.service'; 

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService, 
    @InjectModel(Otp.name) private otpModel: Model<Otp>,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user._id };

    // 🎯 Use TokenService instead of JwtService
    const accessToken = this.tokenService.generateAccessToken(payload);
    const refreshToken = this.tokenService.generateRefreshToken(payload);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  // 🟢 Generate OTP and send to email
  async generateAndSaveOtp(email: string) {
    const existing = await this.otpModel.findOne({ email });
    const now = new Date();

    if (existing && existing.blockedUntil && existing.blockedUntil > now) {
      const diff = Math.ceil(
        (existing.blockedUntil.getTime() - now.getTime()) / 1000,
      );
      return { message: `You are blocked. Try again in ${diff} seconds.` };
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

    await this.otpModel.findOneAndUpdate(
      { email },
      { otpHash, expiresAt, attempts: 0, blockedUntil: null },
      { upsert: true, new: true },
    );

    await this.emailService.sendOtpEmail(email, otp);
    return { message: 'OTP sent successfully to your email.' };
  }

  // 🔁 Resend OTP
  async resendOtp(email: string) {
    const record = await this.otpModel.findOne({ email });
    const now = new Date();

    if (record && record.blockedUntil && record.blockedUntil > now) {
      const seconds = Math.ceil(
        (record.blockedUntil.getTime() - now.getTime()) / 1000,
      );
      return { message: `You are blocked. Try again in ${seconds} seconds.` };
    }

    return this.generateAndSaveOtp(email);
  }

  // ✅ Confirm OTP
  async confirmOtp(email: string, otp: string) {
    const record = await this.otpModel.findOne({ email });
    if (!record) return { message: 'No OTP found for this email.' };

    const now = new Date();
    if (record.expiresAt < now) {
      return { message: 'OTP expired.' };
    }

    const isMatch = await bcrypt.compare(otp, record.otpHash);
    if (!isMatch) {
      record.attempts += 1;
      if (record.attempts >= 5) {
        record.blockedUntil = new Date(Date.now() + 5 * 60 * 1000); // block for 5 min
      }
      await record.save();
      return { message: 'Invalid OTP. Try again.' };
    }

    await this.userService.confirmEmail(email);
    await this.otpModel.deleteOne({ email });
    return { message: 'Email confirmed successfully.' };
  }
}
