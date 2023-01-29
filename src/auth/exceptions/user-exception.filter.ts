import { Response } from 'express';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { UserAlreadyExistException } from './user-exception';

@Catch(UserAlreadyExistException)
export class UserAlreadyExistExceptionFilter implements ExceptionFilter {
  catch(exception: UserAlreadyExistException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message: exception.message,
      error: 'Bad Request',
    });
  }
}
