import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { SignupDto } from '../dto/signup.dto';
import { LoginDto } from '../dto/login.dto';
import { EmailService } from './email.service';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
  ) {}

  // 🟢 Signup
  @Post('signup')
  async signup(@Body() dto: SignupDto) {
    const user = await this.userService.createUser(
      dto.name,
      dto.email,
      dto.password,
    );
    return this.authService.generateAndSaveOtp(dto.email);
  }

  // 🟢 Request OTP
  @Post('request-otp')
  async requestOtp(@Body('email') email: string) {
    return this.authService.generateAndSaveOtp(email);
  }

  // 🔁 Resend OTP
  @Post('resend-otp')
  async resendOtp(@Body('email') email: string) {
    return this.authService.resendOtp(email);
  }

  // ✅ Confirm OTP / Confirm Email
  @Post('confirm-otp')
  async confirmOtp(@Body() body: { email: string; otp: string }) {
    return this.authService.confirmOtp(body.email, body.otp);
  }

  // 🔓 Login
  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user) return { message: 'Invalid credentials.' };

    if (!user.isEmailConfirmed)
      return { message: 'Please confirm your email before logging in.' };

    return this.authService.login(user);
  }

  // 🛡️ Protected route example
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: Request) {
    return { user: req.user };
  }
}
