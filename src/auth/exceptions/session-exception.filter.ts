import { Response } from 'express';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import {
  InvalidSessionRequestException,
  SessionExpiredException,
} from './session-exception';

@Catch(InvalidSessionRequestException)
export class InvalidSessionRequestExceptionFilter implements ExceptionFilter {
  catch(exception: InvalidSessionRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message: exception.message,
      error: 'Bad Request',
    });
  }
}

@Catch(SessionExpiredException)
export class SessionExpiredExceptionFilter implements ExceptionFilter {
  catch(exception: SessionExpiredException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message: exception.message,
      error: 'Bad Request',
    });
  }
}
