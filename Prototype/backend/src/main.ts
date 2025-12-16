import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { RequestMethod } from '@nestjs/common';
import { CorsExceptionFilter } from './common/cors.exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
<<<<<<< HEAD
  
  // Configure CORS to allow both development and production origins
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'https://p04-trade-up.vercel.app',
      'https://p04-trade-up1.vercel.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  console.log('CORS configured for origins:', [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'https://p04-trade-up.vercel.app',
    'https://p04-trade-up1.vercel.app'
  ]);
  
=======

  // Define allowed origins
  const allowedOrigins = [
    'http://localhost:3000',
    'https://p04-trade-up.vercel.app', 
  ];

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // Required for cookies/authorization headers
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

>>>>>>> 628b917f7cef3fbceefa4a642393f7368c7b7ac9
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new CorsExceptionFilter());
  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3001);
}
void bootstrap();