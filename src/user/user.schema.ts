import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from '../auth/roles.enum';

@Schema()
export class User extends Document {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ default: false })
  isEmailConfirmed!: boolean;

  
  @Prop({ type: String, enum: Role, default: Role.User })
  role!: Role;

  
  @Prop({ required: false })
  googleId?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
