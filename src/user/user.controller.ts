import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 🟢 Route 
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User, Role.Admin, Role.Mechanic)
  @Get('all')
  async getAllUsers() {
    return this.userService.findAll();
  }

  // 🔵 Route 
  @UseGuards(JwtAuthGuard)
  @Roles(Role.User, Role.Admin, Role.Mechanic)
  @Get('profile')
  async getProfile() {
    return { message: 'Access granted ✅' };
  }
}
