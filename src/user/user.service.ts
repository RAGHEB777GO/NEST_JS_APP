import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async createUser(name: string, email: string, password: string): Promise<User> {
    const hashed = await bcrypt.hash(password, 10);
    const createdUser = new this.userModel({ name, email, password: hashed });
    return createdUser.save();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async confirmEmail(email: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user) return null;

    (user as any).isEmailConfirmed = true; 
    return (user as any).save();
  }

  async updateUserPassword(email: string, newPassword: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user) return null;

    const hashed = await bcrypt.hash(newPassword, 10);
    (user as any).password = hashed;
    return (user as any).save();
  }
}
