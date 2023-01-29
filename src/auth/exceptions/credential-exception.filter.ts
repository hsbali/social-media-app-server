import { Response } from 'express';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { InvalidCredentialException } from './credential-exception';

@Catch(InvalidCredentialException)
export class InvalidCredentialExceptionFilter implements ExceptionFilter {
  catch(exception: InvalidCredentialException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message: exception.message,
      error: 'Bad Request',
    });
  }
}
