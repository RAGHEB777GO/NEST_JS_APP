import { Controller, Post, Body, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { SignupDto } from '../dto/signup.dto';
import { LoginDto } from '../dto/login.dto';
import { EmailService } from './email.service';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('signup')
  async signup(@Body() dto: SignupDto) {
    const user = await this.userService.createUser(dto.name, dto.email, dto.password);
    const token = this.jwtService.sign({ email: user.email }, { expiresIn: '1h' });
    await this.emailService.sendConfirmationEmail(user.email, token);
    return { message: 'User created, check email for confirmation', user };
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user) return { message: 'Invalid credentials' };
    return this.authService.login(user);
  }

  @Get('confirm-email')
  async confirmEmail(@Query('token') token: string) {
    try {
      const payload = this.jwtService.verify(token);
      await this.userService.confirmEmail(payload.email);
      return { message: 'Email confirmed' };
    } catch (err) {
      return { message: 'Invalid or expired token' };
    }
  }

  @Post('forget-password')
  async forgetPassword(@Body('email') email: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) return { message: 'User not found' };

    const token = this.jwtService.sign({ email: user.email }, { expiresIn: '1h' });
    await this.emailService.sendResetPasswordEmail(user.email, token);
    return { message: 'Reset password email sent' };
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; password: string }) {
    try {
      const payload = this.jwtService.verify(body.token);
      const user = await this.userService.findByEmail(payload.email);

      if (!user) {
        return { message: 'User not found' };
      }

      user.password = await bcrypt.hash(body.password, 10);
      await this.userService.updateUserPassword(user.email, user.password);

      return { message: 'Password reset successful' };
    } catch {
      return { message: 'Invalid or expired token' };
    }
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req: Request) {
    return this.authService.login(req.user);
  }
}
