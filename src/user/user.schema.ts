import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: true })
  name!: string; // ✅ أضفنا "!"

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ default: false })
  isEmailConfirmed!: boolean;

  @Prop()
  googleId?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
