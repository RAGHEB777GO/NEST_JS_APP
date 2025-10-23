import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config(); 

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  console.log('⏳ Connecting to the database...');

  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nestapp');
    console.log('✅ MongoDB Connected Successfully!');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err);
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB Disconnected!');
  });

  await app.listen(process.env.PORT || 3000);
  console.log(`🚀 Server running on http://localhost:${process.env.PORT || 3000}`);
}

bootstrap();
