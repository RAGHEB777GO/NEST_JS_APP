import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'yourgmail@gmail.com',
        pass: 'yourapppassword', 
      },
    });
  }

  async sendConfirmationEmail(to: string, token: string) {
    const url = `http://localhost:3000/auth/confirm-email?token=${token}`;
    await this.transporter.sendMail({
      from: 'yourgmail@gmail.com',
      to,
      subject: 'Confirm your email',
      html: `Click <a href="${url}">here</a> to confirm your email`,
    });
  }

  async sendResetPasswordEmail(to: string, token: string) {
    const url = `http://localhost:3000/auth/reset-password?token=${token}`;
    await this.transporter.sendMail({
      from: 'yourgmail@gmail.com',
      to,
      subject: 'Reset your password',
      html: `Click <a href="${url}">here</a> to reset your password`,
    });
  }
}
