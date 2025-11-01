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
    const createdUser = new this.userModel({
      name,
      email,
      password: hashed,
      isEmailConfirmed: false,
    });
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

    user.isEmailConfirmed = true;
    await user.save();

    return user;
  }

  async updateUserPassword(email: string, newPassword: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user) return null;

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    return user;
  }

  // 🆕 هنا الدالة الجديدة اللي كانت ناقصة
  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }
}
