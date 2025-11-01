import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from './jwt.strategy';
import { EmailService } from './email.service';
import { GoogleStrategy } from './google.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtSignOptions } from '@nestjs/jwt/dist/interfaces/jwt-module-options.interface';
import { MongooseModule } from '@nestjs/mongoose';
import { Otp, OtpSchema } from './otp.schema';
import { TokenService } from './token.service'; 
@Module({
  imports: [
    UserModule,
    ConfigModule,
    MongooseModule.forFeature([{ name: Otp.name, schema: OtpSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const expiresIn: JwtSignOptions['expiresIn'] =
          (configService.get<number>('JWT_EXPIRES_IN') as any) || 3600; // 1 hour
        return {
          secret: configService.get<string>('JWT_SECRET') || 'defaultSecret',
          signOptions: { expiresIn },
        };
      },
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    EmailService,
    GoogleStrategy,
    TokenService, // 🆕 add TokenService
  ],
  controllers: [AuthController],
})
export class AuthModule {}
