import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as bcrypt from 'bcrypt';

export type OtpDocument = HydratedDocument<Otp>;

@Schema({ timestamps: true })
export class Otp {
  @Prop({ required: true, index: true, type: String })
  email!: string;

  @Prop({ required: true, type: String })
  otpHash!: string;

  @Prop({ required: true, type: Date })
  expiresAt!: Date;

  @Prop({ default: 0, type: Number })
  attempts!: number;

  @Prop({ default: null, type: Date })
  blockedUntil!: Date | null;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);

// 🟢 Hash 
OtpSchema.pre<OtpDocument>('save', async function (next) {
  if (this.isModified('otpHash') && !this.otpHash.startsWith('$2b$')) {
    const salt = await bcrypt.genSalt(10);
    this.otpHash = await bcrypt.hash(this.otpHash, salt);
  }
  next();
});

OtpSchema.index({ email: 1 });
OtpSchema.index({ createdAt: 1 });
