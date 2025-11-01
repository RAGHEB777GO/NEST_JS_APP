import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });
  }

  async sendConfirmationEmail(email: string, token: string) {
    const confirmUrl = `http://localhost:3000/auth/confirm-email?token=${token}`;
    const mailOptions = {
      from: `"Pro Garage" <${this.configService.get<string>('EMAIL_USER')}>`,
      to: email,
      subject: 'Confirm your email',
      html: `
        <h2>Welcome to Pro Garage!</h2>
        <p>Please confirm your email by clicking the link below:</p>
        <a href="${confirmUrl}" style="color:#1e88e5;">Confirm Email</a>
        <br/><br/>
        <small>This link expires in 1 hour.</small>
      `,
    };
    await this.transporter.sendMail(mailOptions);
    this.logger.log(`Confirmation email sent to ${email}`);
  }

  async sendResetPasswordEmail(email: string, token: string) {
    const resetUrl = `http://localhost:3000/reset-password?token=${token}`;
    const mailOptions = {
      from: `"nestapp" <${this.configService.get<string>('EMAIL_USER')}>`,
      to: email,
      subject: 'Reset your password',
      html: `
        <h2>Password Reset Request</h2>
        <p>Click below to reset your password:</p>
        <a href="${resetUrl}" style="color:#e53935;">Reset Password</a>
      `,
    };
    await this.transporter.sendMail(mailOptions);
    this.logger.log(`Reset password email sent to ${email}`);
  }

  // 🟢 
  async sendOtpEmail(email: string, otp: string) {
    const mailOptions = {
      from: `"nest app" <${this.configService.get<string>('EMAIL_USER')}>`,
      to: email,
      subject: 'Your OTP Code',
      html: `
        <h2>Verification Code</h2>
        <p>Your OTP is: <strong>${otp}</strong></p>
        <p>This code will expire in <b>2 minutes</b>.</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`OTP email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send OTP to ${email}`, error);
      throw error;
    }
  }
}
