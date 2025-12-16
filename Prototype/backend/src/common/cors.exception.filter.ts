import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class CorsExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    console.log('Exception caught in CorsExceptionFilter:', exception);
    console.log('Request URL:', request.url);
    console.log('Request method:', request.method);

    // Set CORS headers for all responses, including error responses
    // Allow both development and production origins
    const allowedOrigins = [
      'http://localhost:3000',
      'https://p04-trade-up.vercel.app'
    ];
    const requestOrigin = request.headers.origin;
    
    if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
      response.header('Access-Control-Allow-Origin', requestOrigin);
    } else {
      response.header('Access-Control-Allow-Origin', 'https://p04-trade-up.vercel.app');
    }
    
    response.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    response.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
    response.header('Access-Control-Allow-Credentials', 'true');

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception instanceof HttpException ? exception.getResponse() : 'Internal server error',
    });
  }
}